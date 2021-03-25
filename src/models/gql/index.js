import Sequelize from 'sequelize'

// define idea from https://stackoverflow.com/a/20395054
const config = {
  username: "parallesson-user",
  password: "parallesson-mighty-@-pwd",
  database: "parallesson",
  host: "127.0.0.1",
  port: "43210",
  dialect: "postgres",
  operatorsAliases: 0, 
  define: {
    timestamps: false
  }
}

const sequelize = new Sequelize(config.database, config.username, config.password, config)

// look at the Initialise all your models section, https://codewithhugo.com/using-es6-classes-for-sequelize-4-models/
import sourceModel from './source.js'

const models = {
  Source: sourceModel(sequelize, Sequelize)
}

Object.values(models)
  .filter(model => model.associate)
  .map(model => model.associate(models))

const db = {
  ...models,
  sequelize
}

export default db
