const cds = require('@sap/cds')

module.exports = cds.service.impl(async function() {
  const bupa = await cds.connect.to('API_BUSINESS_PARTNER')
  const { A_BusinessPartner } = this.entities

  this.on('READ', A_BusinessPartner, req => bupa.run(req.query))
})