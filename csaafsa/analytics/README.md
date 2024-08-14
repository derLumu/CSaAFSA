
# Nest-lieh

Nest-lieh is a helper Libary supporting you documenting exceptions completely and correctly in NestJS.
It support the usage of nestjs/swagger exception documentation as well as the usage of nestia exception documentation.
In addition to this, Nest-lieh helps you tracking some metrics about your endpoints and datatypes.

Nest-lieh consists of two tools:
- A command line based [static analyser](src/README.md)
- A TypeScript [Language Server Plugin](src/serverPlugin/README.md) for dynamic assistence



add to tsconfig.json
```
"compilerOptions": {
  "plugins": [
    { 
      "name": "@derlumu/nest-lieh" ,
      "configPath": <path-to-your-config>
    }
  ]
}
```