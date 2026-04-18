migrate(
  (app) => {
    let collection
    try {
      collection = app.findCollectionByNameOrId('users')
    } catch (_) {
      try {
        collection = app.findCollectionByNameOrId('_pb_users_auth_')
      } catch (_) {
        collection = new Collection({
          id: '_pb_users_auth_',
          name: 'users',
          type: 'auth',
          listRule: 'id = @request.auth.id',
          viewRule: 'id = @request.auth.id',
          createRule: '',
          updateRule: 'id = @request.auth.id',
          deleteRule: 'id = @request.auth.id',
          authRule: '',
          manageRule: null,
          fields: [
            { name: 'name', type: 'text' },
            {
              name: 'role',
              type: 'select',
              values: ['admin', 'owner', 'editor', 'viewer', 'user'],
              maxSelect: 1,
            },
          ],
        })
        app.save(collection)
        return
      }
    }

    if (!collection.fields.getByName('name')) {
      collection.fields.add(new TextField({ name: 'name' }))
    }

    if (!collection.fields.getByName('role')) {
      collection.fields.add(
        new SelectField({
          name: 'role',
          values: ['admin', 'owner', 'editor', 'viewer', 'user'],
          maxSelect: 1,
        }),
      )
    }

    app.save(collection)
  },
  (app) => {
    try {
      const collection = app.findCollectionByNameOrId('users')
      app.delete(collection)
    } catch (_) {}
  },
)
