migrate(
  (app) => {
    const users = app.findCollectionByNameOrId('_pb_users_auth_')

    if (!users.fields.getByName('job_title')) {
      users.fields.add(new TextField({ name: 'job_title' }))
    }
    if (!users.fields.getByName('avatar_url')) {
      users.fields.add(new TextField({ name: 'avatar_url' }))
    }
    if (!users.fields.getByName('can_delete_reports')) {
      users.fields.add(new BoolField({ name: 'can_delete_reports' }))
    }
    if (!users.fields.getByName('can_generate_reports')) {
      users.fields.add(new BoolField({ name: 'can_generate_reports' }))
    }
    if (!users.fields.getByName('allowed_tabs')) {
      users.fields.add(new JSONField({ name: 'allowed_tabs' }))
    }

    users.listRule = "@request.auth.id != ''"
    users.viewRule = "@request.auth.id != ''"
    users.updateRule =
      "id = @request.auth.id || @request.auth.role = 'admin' || @request.auth.role = 'owner'"
    users.deleteRule =
      "id = @request.auth.id || @request.auth.role = 'admin' || @request.auth.role = 'owner'"

    app.save(users)
  },
  (app) => {
    const users = app.findCollectionByNameOrId('_pb_users_auth_')

    users.fields.removeByName('job_title')
    users.fields.removeByName('avatar_url')
    users.fields.removeByName('can_delete_reports')
    users.fields.removeByName('can_generate_reports')
    users.fields.removeByName('allowed_tabs')

    users.listRule = 'id = @request.auth.id'
    users.viewRule = 'id = @request.auth.id'
    users.updateRule = 'id = @request.auth.id'
    users.deleteRule = 'id = @request.auth.id'

    app.save(users)
  },
)
