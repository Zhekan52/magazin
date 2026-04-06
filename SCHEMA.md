# Retail Management System JSON Schema

## Category Schema
```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "Category",
  "type": "object",
  "properties": {
    "id": { "type": "string" },
    "name": { "type": "string" }
  },
  "required": ["id", "name"]
}
```

## Product Schema
```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "Product",
  "type": "object",
  "properties": {
    "id": { "type": "string" },
    "categoryId": { "type": "string" },
    "name": { "type": "string" },
    "image": { "type": "string", "format": "uri" },
    "price": { "type": "number", "minimum": 0 },
    "salePrice": { "type": "number", "minimum": 0 },
    "hasDiscount": { "type": "boolean" }
  },
  "required": ["id", "categoryId", "name", "image", "price", "hasDiscount"]
}
```

## Order Schema
```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "Order",
  "type": "object",
  "properties": {
    "id": { "type": "string" },
    "code": { "type": "string", "pattern": "^[0-9]{4}$" },
    "items": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "id": { "type": "string" },
          "productId": { "type": "string" },
          "quantity": { "type": "integer", "minimum": 1 },
          "status": {
            "type": "string",
            "enum": ["IN_TRANSIT", "ARRIVED", "PICKED_UP", "REJECTED"]
          }
        },
        "required": ["id", "productId", "quantity", "status"]
      }
    },
    "status": {
      "type": "string",
      "enum": ["ACTIVE", "COMPLETED"]
    },
    "createdAt": { "type": "number" }
  },
  "required": ["id", "code", "items", "status", "createdAt"]
}
```