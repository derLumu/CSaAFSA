# Endpoint analyser

The endpoint analysis can be split into two parts, analysing th endpoint itself and analysing its exception documentation

## Endpoint metrics

Four strait forward characteristics are extracted here:

1. Sum of endpoints
2. Sum of endpoints with unique names
3. Sum of endpoints with unique url
4. Sum of unused endpoints 

Additional for unused and duplicated endpoints diagnostics are created.

## Exception analysis

Before analysing the exceptions an advanced method of collecting handles exceptions is conducted.
This collection is needed, because users may have used their own decorators.
These decorators themself can contain exception handling decorators.

To perform this search it is tryed to access all decorators method declaration.
This is only possible if this delaration is contained in the given backend files.
Otherwise the used type checker cannot find the requested declaration.
Taken the extracted declaration all recursivly called methods are searched for the appliance of exception handling decorators.

After this step the main exception analysis is conducted.
Therefore the exceptions thrown by an endpoint are extracted.
Taken the given endpoints all recursivly called methods are searched for throw statements.
If a throw statement is found, the classname of the thrown exception is safed.
While this search is conducted, the analyser also looks wether mapped exceptions needs to be applied.

With the now gathered information the following characteristics can be analysed:

- Sum of thrown exceptions
- Sum of unhandled exceptions
- Sum of thrown but not handled exceptions

Additional for all of these characteristics diagnostics are created.