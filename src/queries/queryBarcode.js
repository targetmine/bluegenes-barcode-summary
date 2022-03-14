const queryBarcode = geneId => ({
	from: 'Gene',
	select: [
		'primaryIdentifier',
		'symbol',
		'probeSets.probeSetId',
		'probeSets.expressions.tissue.name',
		'probeSets.expressions.platform.title'
	],
	where: [
		{
			path: 'probeSets.expressions.value',
			op: '>',
			value: '0.5',
			code: 'B'
		},
		{
			path: 'probeSets.expressions',
			type: 'BarcodeExpression'
		},
		{
			path: 'Gene.id',
			op: '=',
			value: geneId,
			code: 'A'
		}
	],
	constraintLogic: 'A and B'
});

// eslint-disable-next-line
function queryData(geneId, serviceUrl, imjsClient = imjs) {
	return new Promise((resolve, reject) => {
		const service = new imjsClient.Service({ root: serviceUrl });
		service
			.records(queryBarcode(geneId))
			.then(data => {
				if (data.length) resolve(data[0]);
				else reject('No Barcode data.');
			})
			.catch(reject);
	});
}

module.exports = queryData;
