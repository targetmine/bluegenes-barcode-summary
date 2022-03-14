import React from 'react';
import queryBarcode from './queries/queryBarcode';
import Loading from './loading';

class BarcodeInfoSummary extends React.Component {
	render() {
		const barcodeData = this.props.data;

		const barcodeMap = barcodeData.barcodeMap;

		const data = [];

		let platforms = Object.keys(barcodeMap);
		platforms.forEach(platform => {
			let tissues = Object.keys(barcodeMap[platform]);
			let allTissues = tissues
				.map((entry, index) => (
					<span
						key={index}
						className="naviLink"
						onClick={() => {
							this.props.navigate('report', {
								type: barcodeData.tissueMap[entry].class,
								id: entry
							});
						}}
					>
						{barcodeData.tissueMap[entry].name}
					</span>
				))
				.reduce((prev, curr) => [prev, ', ', curr]);

			data.push({
				platform: barcodeData.platformMap[platform],
				tissue: allTissues,
				num: tissues.length
			});
		});

		return (
			<div>
				{data.map((row, index) => (
					<div key={index}>
						<h2 className="platform">
							<span
								className="naviLink"
								onClick={() => {
									this.props.navigate('report', {
										type: row.platform.class,
										id: row.platform.objectId
									});
								}}
							>
								{row.platform.title}
							</span>
						</h2>
						<div className="numoftissue">
							Expressed in {row.num} tissues or cells:
						</div>
						<div className="alltissue">{row.tissue}</div>
					</div>
				))}
			</div>
		);
	}
}

class RootContainer extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			barcodeData: { platformMap: [], tissueMap: [], barcodeMap: [] },
			noData: false,
			message: ''
		};
	}

	componentDidMount() {
		queryBarcode(this.props.entity.Gene.value, this.props.serviceUrl)
			.then(res => {
				let barcodeMap = {};
				let platformMap = {};
				let tissueMap = {};
				res.probeSets.forEach(probeSet => {
					probeSet.expressions.forEach(expression => {
						let tissueId = expression.tissue.objectId;
						tissueMap[tissueId] = expression.tissue;
						let platformId = expression.platform.objectId;
						platformMap[platformId] = expression.platform;
						if (!barcodeMap[platformId]) {
							barcodeMap[platformId] = {};
						}
						if (barcodeMap[platformId][tissueId]) {
							barcodeMap[platformId][tissueId].probeSets.push(probeSet);
						} else {
							barcodeMap[platformId][tissueId] = { probeSets: [probeSet] };
						}
					});
				});
				let data = {
					platformMap: platformMap,
					tissueMap: tissueMap,
					barcodeMap: barcodeMap
				};
				this.setState({ barcodeData: data, message: 'OK' });
			})
			.catch(error => {
				this.setState({ noData: true, message: error });
			});
	}

	render() {
		return (
			<div className="rootContainer">
				{this.state.message == '' ? (
					<Loading />
				) : this.state.noData ? (
					<div className="noData">
						Gene Expression Barcode 3.0 data not available.
					</div>
				) : (
					<BarcodeInfoSummary
						data={this.state.barcodeData}
						navigate={this.props.navigate}
					/>
				)}
				<div className="reference">
					Data set: The Gene Expression Barcode 3.0;{' '}
					<a
						href="https://pubmed.ncbi.nlm.nih.gov/24271388/"
						target="_blank"
						rel="noreferrer"
					>
						PMID: 24271388
					</a>
				</div>
			</div>
		);
	}
}

export default RootContainer;
