# Extraction

In this section endpoints and datatypes are extracted.

## Datatype extraction

To extract the datatypes the following steps are conducted:

1. Extract all class and interface declarations, as well as type alias' from the sourcefiles by looking at the sourcefiles `member` property
2. Convert these declarations into intern `datatype` objects
    1. Ignore declarations with other members then property declarations or signatures
    2. Extract the declarations properties by looking at the declarations `member` property
    3. Extract the declarations decorator by looking at the declarations `modifier` property
    4. Read all other needed properties directly from the declaration object
3. Return a list of all extracted datatypes

## Endpoint extraction

To extract the endpoints the following steps are conducted:

1. Extract all class and interface declarations, as well as type alias' from the sourcefiles by looking at the sourcefiles `member` property. Only look at classes with the `@Controller` Annotation
    1. Taken this Annotation extract the controllers path by accessing the annotations arguments
2. Extract all methods from the found controllers by looking at the methods `member` property.
    1. Try to find a HTTP method in the methods annotations. If sucessfull, the method is an endpoint
    2. Get the endpoints handled exceptions by seraching the annotations for exception handling in the nestjs/swagger and nestia syntax
    3. Read all other needed properties directly from the endpoint object

## Api Call extraction
 
If the user enters the frontend path property to its config file the frontend files are analysed. The analyses target is to find calls to the backend to then mark unused endpoints in the backend. To extract the api calls the following steps are conducted:

1. Extract all class and interface declarations, as well as type alias' from the sourcefiles by looking at the sourcefiles `member` property.
2. Extract all methods from the found controllers by looking at the methods `member` property.
3. Recursively traverse all method calls made by the extracted methods. While doing so document all seen api calls 