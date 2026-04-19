migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('activities')
    col.listRule = "@request.auth.id != ''"
    col.viewRule = "@request.auth.id != ''"
    col.createRule = "@request.auth.id != ''"
    col.updateRule = "@request.auth.id != ''"
    col.deleteRule = "@request.auth.id != ''"

    if (!col.fields.getByName('meeting_start')) {
      col.fields.add(new DateField({ name: 'meeting_start' }))
    }
    if (!col.fields.getByName('created')) {
      col.fields.add(new AutodateField({ name: 'created', onCreate: true, onUpdate: false }))
    }
    if (!col.fields.getByName('updated')) {
      col.fields.add(new AutodateField({ name: 'updated', onCreate: true, onUpdate: true }))
    }

    app.save(col)
  },
  (app) => {
    const col = app.findCollectionByNameOrId('activities')
    col.listRule = null
    col.viewRule = null
    col.createRule = null
    col.updateRule = null
    col.deleteRule = null
    app.save(col)
  },
)
