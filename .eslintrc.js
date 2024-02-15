module.exports = {
  rules: {
    '@stylistic/indent': ['error', 2], // indent 2 spaces
    "import/extensions": ["error",
      "ignorePackages",
        {
          "json": "always" // ignore json require (display EXT version and rev date)
        }
    ]
  }
}
