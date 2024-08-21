# Language server plugin

In this section the language server plugin is explained.
Details about how to set up such a plugin can be found in the [official documentation](https://github.com/microsoft/TypeScript/wiki/Writing-a-Language-Service-Plugin).

Nest-lieh overrides three language server features of the TypeScript language service.

## Semantic diagnostics

This feature outputs the IDE diagnostics to show in code.
This is done by these three steps.
These are conducted analoge to the static analysis.

1. Extract [datatypes and endpoints](../extraction/README.md)
2. Analyse the [datatypes](../analyseDatatype/README.md) and safe the diagnostigs, e. g. for duplicated datatypes
3. Analyse the [endpoints](../analyseEndpoint/README.md) and safe the diagnostics, e. g. for unhandles exceptions

The diagnostics are then filtered, so that only diagnostics from the requested file are given to the IDE.

## Applicable refactors

Applying refactors in TypeScript is splitted into two steps.
First the IDE asks for applicable refactors at an specific position, then the IDE asks for possible edits for one of this possible refactors.
Refactors are supported for documenting undocumented exceptions and generating update datatypes.

#### Undocumented exceptions

To decide if an undocumented exception needs to be documented these tasks are executed:

1. Find the method the current request originated from. Use the requests `position` property.
2. Extract the methods endpoint. Use slimmed down variant of the endpoint extractor
3. Start a diagnostic search on this endpoint
4. For ever undocumented exception diagnostic add its information to an array
5. From this array generate an applicable refactor object and give it to the IDE

#### Update datatypes

To decide if an update dadatype can be generated these tasks are executed:

1. Find the method the current request originated from. Use the requests `position` property.
2. Decide wether this method is a datatype
3. Generate an applicable refactor object and give it to the IDE

## Edits for refactor

This features is working analoge to the above one.
The difference is that this time there are no applicable refactor objects build from the collected information.
Here concrete refactorings are outputed that then are applied by the IDE.

For the undocumented exceptions refactor exception documentation annotations are generated and pasted above the endpoints siganture.

For generating update datatypes the NestJS `PartialType` utility function is utalized.
The new datatype will be pasted below the original one.
