import { MODULE_PATH } from '@nestjs/common/constants';
import { Module } from '@nestjs/core/injector/module';
import { NestContainer } from '@nestjs/core/injector/container';
import { extend, flatten, isEmpty, reduce, mapValues, keyBy, get, uniq } from 'lodash';
import { SwaggerDocument } from './interfaces';
import { SwaggerExplorer } from './swagger-explorer';
import { SwaggerTransformer } from './swagger-transformer';
import {
  DEFAULT_BASIC_SECURITY,
  DEFAULT_APIKEY_SECURITY,
  DEFAULT_OAUTH2_SECURITY
} from './constants';

export class SwaggerScanner {
  private static securityDefinitions = {};

  private readonly explorer = new SwaggerExplorer();
  private readonly transfomer = new SwaggerTransformer();

  public static addSecurity(
    name: string,
    type: 'basic' | 'apiKey' | 'oauth2',
    scopes?: string[]
  ) {
    const oldScopes = get(
      SwaggerScanner.securityDefinitions,
      [name, 'scopes'],
      []
    );

    SwaggerScanner.securityDefinitions[name] = {
      ...(type === 'basic' ? DEFAULT_BASIC_SECURITY : {}),
      ...(type === 'apiKey' ? DEFAULT_APIKEY_SECURITY : {}),
      ...(type === 'oauth2' ? DEFAULT_OAUTH2_SECURITY : {}),
      type: type,
      scopes: type === 'oauth2' ? uniq([...oldScopes, ...scopes]) : undefined
    };
  }

  public scanApplication(
    app,
    includedModules: Function[],
    deepScanRoutes?: boolean
  ): SwaggerDocument {
    const { container }: { container: NestContainer } = app;
    const modules: Module[] = this.getModules(
      container.getModules(),
      includedModules
    );
    const denormalizedPaths = modules.map(
      ({ routes, metatype, relatedModules }) => {
        let allRoutes = new Map(routes);

        if (deepScanRoutes) {
          // only load submodules routes if asked
          Array.from(relatedModules.values())
            .filter(
              relatedModule => !container.isGlobalModule(relatedModule as any)
            )
            .map(({ routes: relatedModuleRoutes }) => relatedModuleRoutes)
            .forEach(relatedModuleRoutes => {
              allRoutes = new Map([...allRoutes, ...relatedModuleRoutes]);
            });
        }

        // Note: nest-router
        // Get the module path (if any), to prefix it for all the module controllers.
        const path = metatype
          ? Reflect.getMetadata(MODULE_PATH, metatype)
          : undefined;
        return this.scanModuleRoutes(allRoutes, path);
      }
    );
    return {
      ...this.transfomer.normalizePaths(flatten(denormalizedPaths)),
      securityDefinitions: this.buildSecurityDefinitions(),
      definitions: reduce(this.explorer.getModelsDefinitons(), extend)
    };
  }

  private buildSecurityDefinitions() {
    return mapValues(SwaggerScanner.securityDefinitions, security => {
      if (security.scopes) {
        security.scopes = mapValues(keyBy(security.scopes), v =>
          String(v).toUpperCase()
        );
      }
      return security;
    });
  }

  public scanModuleRoutes(routes, modulePath): SwaggerDocument {
    const denormalizedArray = [...routes.values()].map(ctrl =>
      this.explorer.exploreController(ctrl, modulePath)
    );
    return flatten(denormalizedArray) as any;
  }

  public getModules(
    modulesContainer: Map<any, any>,
    include: Function[]
  ): any[] {
    if (!include || isEmpty(include)) {
      return [...modulesContainer.values()];
    }
    return [...modulesContainer.values()].filter(({ metatype }) =>
      include.some(item => item === metatype)
    );
  }
}
