require('dotenv').config()
const Airtable = require('airtable-node');
const ENV = process.env

const airtable = new Airtable({ apiKey: ENV.AIRTABLE_API_KEY })
  .base(ENV.AIRTABLE_BASE)
  .table(ENV.AIRTABLE_TABLE)

exports.handler = async (event, context) => {
  const { id } = event.queryStringParameters

  if (id) {
    try {
      const product = await airtable.retrieve(id)

      if (product.error) {
        return {
          statusCode: 404,
          body: `No product with id ${id}`,
        }
      }

      return {
        headers: {
          "Content-Type": "text/html; charset=UTF-8"
        },
        statusCode: 200,
        body: JSON.stringify(product)
      }
    } catch (error) {
      return {
        statusCode: 500,
        body: `Server error`,
      }
    }
  }

  try {
    const { records } = await airtable.list()

    const products = records.map(product => {
      const { id } = product;
      const { name, image, price } = product.fields
      const url = image[0].url

      return { id, name, url, price }
    })

    return {
      headers: {
        "Content-Type": "text/html; charset=UTF-8"
      },
      statusCode: 200,
      body: JSON.stringify(products),
    }
  } catch (error) {
    return {
      statusCode: 500,
      body: "Server error"
    }
  }
}