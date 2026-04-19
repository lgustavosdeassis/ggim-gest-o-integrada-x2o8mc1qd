migrate(
  (app) => {
    const collection = app.findCollectionByNameOrId('activities')
    collection.listRule = "@request.auth.id != ''"
    collection.viewRule = "@request.auth.id != ''"
    collection.createRule = "@request.auth.id != ''"
    collection.updateRule = "@request.auth.id != ''"
    collection.deleteRule = "@request.auth.id != ''"
    app.save(collection)
  },
  (app) => {
    const collection = app.findCollectionByNameOrId('activities')
    collection.listRule = null
    collection.viewRule = null
    collection.createRule = null
    collection.updateRule = null
    collection.deleteRule = null
    app.save(collection)
  },
)
