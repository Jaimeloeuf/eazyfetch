# DEPRECATED
`eazyfetch` library is fully deprecated. No new changes are expected to land. This library is still not complete and will probably never be completed.  
This is deprecated because [simpler-fetch](https://github.com/Enkel-Digital/simpler-fetch/) turned out to be a much better alternative and can do most of what this library intends to achieve too, which is to make browser's `fetch` API easier to work with.  

The main difference is that simpler-fetch is a much more low level library, without support for plugins at least at the time of writing this. So there are some changes in how you structure your API calls, but for most basic tasks, it is more than enough to fully replace this.

See this [`simpler-fetch` documentation](https://github.com/Enkel-Digital/simpler-fetch#readme) to migrate, and here is [documentation on using firebase auth](https://github.com/Enkel-Digital/simpler-fetch/blob/master/firebase-auth.md) with `simpler-fetch`.

# eazyfetch
Opinionated library that extends the browsers' fetch API to simplify its API and to provide a simple to use plugin architecture to allow for more advanced features to be easily built on top of the fetch API.

Note that this is essentially a thin wrapper over [fetch](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API) with some added functionalities to,
1. Simplify the fetch API through abstractions and opinionated design patterns.
2. Allow you to define base API URL(s) to make API calls cleaner and simpler, allowing you to change the base URL for all APIs at a single location.
3. Extend or modify [fetch request's init parameter](https://developer.mozilla.org/en-US/docs/Web/API/WindowOrWorkerGlobalScope/fetch#Parameters) by layering multiple init objects easily.
4. Simple to use plugin architecture to allow advanced features to be added easily.

## Dependencies
- This package depends on the browsers' fetch method.
    - *Will throw an error if this library is loaded in an environment where fetch is unavailable!*

## How to use this library
1. User register plugins that they want to use right after loading this library in a module, and use the newly created object as the single default export of that module.
2. Every where that needs to call APIs, just import the module that was created in step 1, and use it according to the API

## Examples
-- TODO --

## Plugin System
How the plugin system work:
- Plugins are modules that are used as "middlewares" or simply code that run in sequence for every API call.

Notes / FAQ:
- Plugins are used on all API calls, meaning that plugins are used for ALL and different base API URLs, so you might want to take this into consideration, especially if you are building authentication plugins. Make sure to wrap these plugins in factory functions to store what base API URLs to run on before registering the plugin to limit its use.

## Plugins available
- 

## Roadmap / planned features
- Allow users to define base API URL specific plugins instead of making plugin developers do route checking manually themselves.

## Technical Details
- Allow you to call arbitrary HTTP methods using the Proxy meta programming method
- Chaining with modify is implmeneted by returning a new but similiar proxy

## License, Author, Contributing and credits
This project takes inspirations from these projects:
- <https://github.com/RealmTeam/easyfetch>
- <https://github.com/Enkel-Digital/fetch-with-fire>

This project is developed and made available under the "MIT License". Feel free to use it however you like and contribute if you would like to help make this a better project!  
If you have any questions, contact us via [email](mailto:tech@enkeldigital.com)  
Authors:
- [JJ](https://github.com/Jaimeloeuf)