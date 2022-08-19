export const setPrintXmlList = function(xml) {
  let xmlList = xml.split('<?xml version="1.0" encoding="utf-8"?>')
  console.log('原始', xmlList)
  xmlList.shift()
  if (!xmlList[0].includes('DocExtendParam1')) {
    console.log('历史单打印--')
    return xmlList
  }
  let filterXmlList = xmlList.filter(item => {
    return item.includes('<DocExtendParam1>1</DocExtendParam1>')
  })
  console.log('过滤', xmlList)
  return filterXmlList
}
