# Extraction

In this section endpoints and datatypes are extracted.

## Datatype extraction

To extract the datatype the following steps are conducted:

1. Extract all class and interface declarations, as well as type alias' from the sourcefiles by looking at the sourcefiles `member` property
2. Convert these declarations into intern `datatype` objects
    1. Ignore declarations with other members then property declarations or signatures
    2. Extract the declarations properties by looking at the declarations `member` property
    3. Extract the declarations decorator by looking at the declarations `modifier` property
    4. Read all other needed properties directly from the declaration object
3. Return a list of all extracted datatypes

## Endpoint extraction

