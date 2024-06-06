run ``nx build analytics``

run ``cd dist/analytics``

change package.json to 
```
{
  "name": "analytics",
  "version": "1.0.0",
  "main": "src/index.js",
  "scripts": {
    "build": "tsc -p ."
  },
  "dependencies": {
    "typescript": "^4.5.4"
  }
}
```

run ``npm link``

in target project run ``npm link analytics``

add to tsconfig.json
```
{
  "plugins": [
    { "name": "your-plugin-name" }
  ]
}
```