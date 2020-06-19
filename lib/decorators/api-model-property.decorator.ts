import { DECORATORS } from '../constants';
import { SwaggerEnumType } from '../types/swagger-enum.type';
import { createPropertyDecorator, getTypeIsArrayTuple } from './helpers';

export interface ReferenceObject {
  $ref: string;
}

export interface SchemaObject {
  additionalProperties?: SchemaObject | ReferenceObject | boolean;
  allOf?: (SchemaObject | ReferenceObject)[];
  anyOf?: (SchemaObject | ReferenceObject)[];
  collectionFormat?: string;
  default?: any;
  deprecated?: boolean;
  description?: string;
  enum?: any[];
  example?: any;
  examples?: any[];
  exclusiveMaximum?: boolean;
  exclusiveMinimum?: boolean;
  format?: string;
  items?: SchemaObject | ReferenceObject;
  maxItems?: number;
  maxLength?: number;
  maxProperties?: number;
  maximum?: number;
  minItems?: number;
  minLength?: number;
  minProperties?: number;
  minimum?: number;
  multipleOf?: number;
  not?: SchemaObject | ReferenceObject;
  nullable?: boolean;
  oneOf?: (SchemaObject | ReferenceObject)[];
  pattern?: string;
  properties?: Record<string, SchemaObject | ReferenceObject>;
  readOnly?: boolean;
  required?: string[];
  title?: string;
  type?: string;
  uniqueItems?: boolean;
  writeOnly?: boolean;
  xml?: any;
}

export interface SchemaObjectMetadata
  extends Omit<SchemaObject, 'type' | 'required'> {
  type?: any;
  isArray?: boolean;
  required?: boolean;
  name?: string;
  enumName?: string;
}

export const ApiModelProperty = (
  metadata: {
    additionalProperties?: SchemaObject | ReferenceObject | boolean;
    collectionFormat?: string;
    default?: any;
    description?: string;
    enum?: SwaggerEnumType;
    example?: any;
    exclusiveMaximum?: boolean;
    exclusiveMinimum?: boolean;
    format?: string;
    in?: string;
    isArray?: boolean;
    maxItems?: number;
    maxLength?: number;
    maxProperties?: number;
    maximum?: number;
    minItems?: number;
    minLength?: number;
    minProperties?: number;
    minimum?: number;
    multipleOf?: number;
    nullable?: boolean;
    pattern?: string;
    readOnly?: boolean;
    required?: boolean;
    type?: any;
    uniqueItems?: boolean;
    xml?: any;
  } = {}
): PropertyDecorator => {
  const [type, isArray] = getTypeIsArrayTuple(metadata.type, metadata.isArray);
  return createPropertyDecorator(DECORATORS.API_MODEL_PROPERTIES, {
    ...metadata,
    type,
    isArray
  });
};

export const ApiModelPropertyOptional = (
  metadata: {
    additionalProperties?: SchemaObject | ReferenceObject | boolean;
    collectionFormat?: string;
    default?: any;
    description?: string;
    enum?: SwaggerEnumType;
    example?: any;
    exclusiveMaximum?: boolean;
    exclusiveMinimum?: boolean;
    format?: string;
    in?: string;
    isArray?: boolean;
    maxItems?: number;
    maxLength?: number;
    maxProperties?: number;
    maximum?: number;
    minItems?: number;
    minLength?: number;
    minProperties?: number;
    minimum?: number;
    multipleOf?: number;
    nullable?: boolean;
    pattern?: string;
    readOnly?: boolean;
    type?: any;
    uniqueItems?: boolean;
    xml?: any;
  } = {}
): PropertyDecorator =>
  ApiModelProperty({
    ...metadata,
    required: false
  });

export const ApiResponseModelProperty = (
  metadata: {
    type?: any;
    example?: any;
  } = {}
): PropertyDecorator =>
  ApiModelProperty({
    ...metadata
  });
