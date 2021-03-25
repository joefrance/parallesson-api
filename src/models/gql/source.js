export default function sourceModel(sequelize, {DataTypes}) {
    return sequelize.define('source', {
      source_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
      },
      source_name: {
        type: DataTypes.STRING,
        allowNull: false
      },
      source_desc: {
        type: DataTypes.STRING,
        allowNull: false
      },
      source_url: {
        type: DataTypes.STRING,
        allowNull: false
      },
      source_repo: {
        type: DataTypes.STRING,
        allowNull: false
      },
      source_html: {
        type: DataTypes.STRING,
        allowNull: false
      }
    }, {
      tableName: 'sources'
    })
  }
  