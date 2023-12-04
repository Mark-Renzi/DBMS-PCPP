import React, { useState, useEffect, useContext } from 'react';
import Dropdown from 'react-bootstrap/Dropdown';
import Pagination from 'react-bootstrap/Pagination';
import Modal from 'react-bootstrap/Modal';
import NumberInput from '../NumberInput/NumberInput';
import Button from 'react-bootstrap/Button';
import Spinner from 'react-bootstrap/Spinner';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Link } from 'react-router-dom';
import Details from '../Details';
import PageTitleContext from '../../context/pageTitleContext';
import './style.css';

const PricePerformanceLeaderboard = () =>{
	const [part, setPart] = useState('GPU');
	const [benchType, setBenchType] = useState(0);
	const [benchName, setBenchName] = useState('G3Dmark');
	const [comparison, setComparison] = useState('Price');
	const [metric, setMetric] = useState('TDP');
	const [cpuBenchType, setCPUBenchType] = useState(7);
	const [gpuBenchType, setGPUBenchType] = useState(0);
	const [cpuBenchName, setCPUBenchName] = useState('CPUMark');
	const [gpuBenchName, setGPUBenchName] = useState('G3Dmark');
	const [partsList, setPartsList] = useState([]);
	const [userLists, setUserLists] = useState([]);
	const [listLoading, setListLoading] = useState(true);
	const [currentPage, setCurrentPage] = useState(1);
	const [showEllipseModal, setShowEllipseModal] = useState(false);
	const [enteredPage, setEnteredPage] = useState(1);
	const [totalResultNum, setTotalResultNum] = useState(0);
	const [showDetailModal, setShowDetailModal] = useState(false);
	const [detailPart, setDetailPart] = useState(null);
	const [tableType, setTableType] = useState('Parts');
	const [showPartsTable, setShowPartsTable] = useState(true);
	const [showListTable, setShowListTable] = useState(false);

	const gpuOptions = ["G3Dmark", "G2Dmark", "CUDA", "Metal", "OpenCL", "Vulkan", "PassMark"];
	const cpuOptions = ["CPUMark", "ThreadMark", "Cinebench R23 Single Score", "Cinebench R23 Multi Score", "PassMark"];
	
	const { updatePageTitle } = useContext(PageTitleContext);
	const pageSize = 20;


	useEffect(() => {
		updatePageTitle("Leaderboards");
		onSubmit();
	}, []);

	useEffect(() => {
		if (showPartsTable) {
			onSubmit();
		}
	}, [tableType, part, benchType, comparison, currentPage]);

	useEffect(() => {
		if (showListTable) {
			onChangeLists();
		}
	}, [tableType, metric, cpuBenchType, gpuBenchType, currentPage]);



	const onChangePartType = (partType) => {
		setPart(partType);
		if (partType === 'GPU') {
			setBenchType(0);
			setBenchName('G3Dmark');
		} else {
			setBenchType(7);
			setBenchName('CPUMark');
		}
		setCurrentPage(1);
	}

	const onChangeBenchType = (benchType, benchName) => {
		setBenchType(benchType);
		setBenchName(benchName);
		setCurrentPage(1);
	}

	const onChangeCPUBenchType = (benchType, benchName) => {
		console.log("benchType", benchType, "benchName", benchName)
		setCPUBenchType(benchType);
		setCPUBenchName(benchName);
		setCurrentPage(1);
	}

	const onChangeGPUBenchType = (benchType, benchName) => {
		setGPUBenchType(benchType);
		setGPUBenchName(benchName);
		setCurrentPage(1);
	}

	const onSubmit = async () => {
		setListLoading(true);
		const url = `/api/benchmarks`;
		const data = { comparisonType: comparison, partType: part, benchType: benchType, pageNumber: currentPage, limitNumber: pageSize };
		let response;
		try {
			response = await axios.post(url, data);
			setPartsList(response?.data?.benchmarks);
			setTotalResultNum(response?.data?.totalResultNum);
			setListLoading(false);
		} catch (e) {
			console.log(e)
		}
	}

	const onChangeLists = async () => {
		setListLoading(true);
		const url = `/api/leaderboards/${metric}`;
		const data = { pageNumber: currentPage, limitNumber: pageSize, cpuBenchType: cpuBenchType, gpuBenchType: gpuBenchType};
		let response;
		try {
			response = await axios.post(url, data);
			setUserLists(response?.data?.lists);
			setTotalResultNum(response?.data?.totalResultNum);
			setListLoading(false);
		} catch (e) {
			console.log(e)
		}
	}

	const onChangeTable = (tableType) => {
		setTableType(tableType);
		if (tableType === 'Parts') {
		  setShowPartsTable(true);
		  setShowListTable(false);
		} else {
		  setShowPartsTable(false);
		  setShowListTable(true);
		}
		setCurrentPage(1);
	  }

	const onChangeComparison = (comparison) => {
		setComparison(comparison);
		setCurrentPage(1);
	}

	const onChangeMetric = (metric) => {
		setMetric(metric);
		if (metric === 'Score') {
			setCPUBenchName('CPUMark');
			setCPUBenchType(7);
			setGPUBenchName('G3Dmark');
			setGPUBenchType(0);
		}
		setCurrentPage(1);
	}

	const onhandleNext = () => {
        let nextPageNumber = Math.min(currentPage + 1, Math.ceil(totalResultNum / pageSize));
        setCurrentPage(nextPageNumber);
    }
    const onhandlePrev = () => {
        let prevPageNumber = Math.max(currentPage - 1, 1);
        setCurrentPage(prevPageNumber);
    }
	const calcPagesToShow = () => {
        let start = Math.max(currentPage - 2, 1);
        let end = Math.min(start + 4, Math.ceil(totalResultNum / pageSize));
        start = Math.max(end - 4, 1);
        let pageList = Array.from({ length: end - start + 1 }, (_, i) => start + i);
        if (currentPage > 3 && Math.ceil(totalResultNum / pageSize) > 5) {
            pageList.unshift(1);
        }
        return pageList;
    }
	const handleModalClose = () => {
        setShowEllipseModal(false);
    }
    const handlePageSubmit = () => {
        let newPage = Math.max(1, Math.min(parseInt(enteredPage), Math.ceil(totalResultNum / pageSize)));
        setCurrentPage(newPage);
        setShowEllipseModal(false);
    }
	const handleEllipseClick = () => {
        setShowEllipseModal(true);
    }
	const handleShowDetailModal = async (partl) => {
		setDetailPart(partl);
		setShowDetailModal(true);
	}
	const handleCloseDetailModal = () => {
		setDetailPart(null);
		setShowDetailModal(false);
	}

	const renderTableHeader = () => {
		if (showPartsTable) {
		  return (
			<tr>
			  <th>Rank</th>
			  <th>Manufacturer</th>
			  <th>Model</th>
			  {part !== "CPU" ? <th>Chipset</th> : null}
			  <th>Score</th>
			  <th>Price</th>
			  <th>Perf/{comparison} Ratio</th>
			</tr>
		  );
		} else if (showListTable) {
		  return (
			<tr>
			  <th>Rank</th>
			  <th>Total Price</th>
			  <th>Name</th>
			  <th>Description</th>
			  <th>{metric === 'TDP' ? 'TDP' : 'Score'}</th>
			</tr>
		  );
		}
	  }

	const renderTableBody = () => {
		if (showPartsTable) {
			return (partsList.map((partl, index) => (
				<tr className='Table-Base-TR Browse-Table' key={partl.partid}>
					<td>{(currentPage - 1) * pageSize + index + 1}</td>
					<td>{partl.manufacturer}</td>
					<td><Link className='btn text-primary' onClick={() => handleShowDetailModal(partl)}>{partl.model}</Link></td>
					{ part !== "CPU" ? <td>{partl.chipset}</td> : null }
					<td>{partl.score}</td>
					<td>${partl.price}</td>
					<td>{parseFloat(comparison === 'Price' ? partl.priceperformance : partl.tdpperformance).toFixed(4)}</td>
				</tr>
				))
			);
		} else if (showListTable) {
			return (
			<>
				{userLists.map((list, index) => (
				<tr className='Table-Base-TR Browse-Table' key={index}>
					<td>{(currentPage - 1) * pageSize + index + 1}</td>
					<td>${list.totalprice}</td>
					<td><Link className='btn text-primary' to={`/lists/${list.listid}`}>{list.name}</Link></td>
					<td>{list.description}</td>
					<td>{metric === 'TDP' ? list.sum_tdp : list.listscore}</td>
				</tr>
				))}
			</>
			);
		}
	}

	return (
		<>
			<Modal show={showEllipseModal} onHide={handleModalClose}>
                <Modal.Header closeButton>
                    <Modal.Title>Enter Page Number</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <NumberInput enteredValue={enteredPage} setEnteredValue={setEnteredPage} onHandleSubmit={handlePageSubmit}/>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleModalClose}>Close</Button>
                    <Button variant="primary" onClick={handlePageSubmit}>Go to page</Button>
                </Modal.Footer>
            </Modal>

			<Modal show={showDetailModal} onHide={handleCloseDetailModal} className="wide-modal">
                <Modal.Header closeButton>
                    <Modal.Title>{detailPart?.manufacturer} {detailPart?.model} Details</Modal.Title>
                </Modal.Header>
                <Modal.Body>
					{detailPart ? (
						<Details
							{...detailPart}
						/>
					) : (
						<Spinner animation="border" role="status">
							<span className="visually-hidden">Loading...</span>
						</Spinner>
					)}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleCloseDetailModal}>Close</Button>
                    {/* <Button variant="primary" href={`/part/${detailPart?.partid}`}>Go to part</Button> */}
                </Modal.Footer>
            </Modal>

			<div className="Page-Content-Container">
				<div className="horizontal-group selection-list">
					<div className="vertical-group-pp">
						<p>
							Table:
						</p>

						<select value={tableType} onChange={(e) => onChangeTable(e.target.value)}>
							<option value="Parts">Parts</option>
							<option value="Lists">Lists</option>
						</select>
					</div>
					
					{showPartsTable && (
						<>
							<div className="vertical-group-pp">
								<p>
									Comparison:
								</p>

								<select value={comparison} onChange={(e) => onChangeComparison(e.target.value)}>
									<option value="Price">Price</option>
									<option value="TDP">TDP</option>
								</select>
							</div>
							<div className="vertical-group-pp">
								<p>
									Computer part:
								</p>

								<select value={part} onChange={(e) => onChangePartType(e.target.value)}>
									<option value="GPU">GPU</option>
									<option value="CPU">CPU</option>
								</select>
							</div>
							<div className="vertical-group-pp">
								<p>
									Benchmark Type:
								</p>
									{part === 'GPU' ?
										<select value={benchName} onChange={(e) => onChangeBenchType(gpuOptions.indexOf(e.target.value), e.target.value)}>
											<option value="G3Dmark">G3Dmark</option>
											<option value="G2Dmark">G2Dmark</option>
											<option value="CUDA">CUDA</option>
											<option value="Metal">Metal</option>
											<option value="OpenCL">OpenCL</option>
											<option value="Vulkan">Vulkan</option>
											<option value="PassMark">PassMark</option>
										</select>
									:
										<select value={benchName} onChange={(e) => onChangeBenchType(cpuOptions.indexOf(e.target.value) + 7, e.target.value)}>
											<option value="CPUMark">CPUMark</option>
											<option value="ThreadMark">ThreadMark</option>
											<option value="Cinebench R23 Single Score">Cinebench R23 Single Score</option>
											<option value="Cinebench R23 Multi Score">Cinebench R23 Multi Score</option>
											<option value="PassMark">PassMark</option>
										</select>
									}
							</div>
						</>
					)}
					{showListTable && (
						<>
							<div className="vertical-group-pp">
								<p>
									Metric:
								</p>

								<select value={metric} onChange={(e) => onChangeMetric(e.target.value)}>
									<option value="TDP">TDP</option>
									<option value="Score">Score</option>
								</select>
							</div>
							{metric === 'Score' && (
								<>
									<div className="vertical-group-pp">
										<p>
											GPU Benchmark:
										</p>
										<select 
											value={gpuBenchName} 
											onChange={(e) => onChangeGPUBenchType(gpuOptions.indexOf(e.target.value), e.target.value)}
										>
											<option value="G3Dmark">G3Dmark</option>
											<option value="G2Dmark">G2Dmark</option>
											<option value="CUDA">CUDA</option>
											<option value="Metal">Metal</option>
											<option value="OpenCL">OpenCL</option>
											<option value="Vulkan">Vulkan</option>
											<option value="PassMark">PassMark</option>
										</select>
									</div>

									<div className="vertical-group-pp">
										<p>
											CPU Benchmark:
										</p>
										<select 
											value={cpuBenchName} 
											onChange={(e) => onChangeCPUBenchType(cpuOptions.indexOf(e.target.value) + 7, e.target.value)}
										>
											<option value="CPUMark">CPUMark</option>
											<option value="ThreadMark">ThreadMark</option>
											<option value="Cinebench R23 Single Score">Cinebench R23 Single Score</option>
											<option value="Cinebench R23 Multi Score">Cinebench R23 Multi Score</option>
											<option value="PassMark">PassMark</option>
										</select>
									</div>
								</>
							)}
						</>
					)}
				</div>
			</div>
			<div className="Page-Content-Container Spacer">
				<div className='Table-Pag'>
					<table className="Table-Base">
						<thead>
							{renderTableHeader()}
						</thead>
						<tbody>
							{listLoading ?
								<tr className='Table-Base-TR Browse-Table'>
									<td className='table-spinner-container' colSpan='7'>
										<div className='table-spinner'>
											<Spinner animation="border" role="status">
												<span className="visually-hidden">Loading...</span>
											</Spinner>
										</div>
									</td>
								</tr>
								:
								<>
									{renderTableBody()}
								</>
							}
						</tbody>
					</table>
					<Pagination>
						<div className="pagination-organize">
							<Pagination.Prev onClick={onhandlePrev} disabled={currentPage === 1} />
							{
								calcPagesToShow().map(page =>
									<Pagination.Item key={page} active={page === currentPage} onClick={() => setCurrentPage(page)}>{page}</Pagination.Item>
								)
							}
							{Math.ceil(totalResultNum / pageSize) > 5 && <Pagination.Ellipsis onClick={handleEllipseClick} />}
							{Math.ceil(totalResultNum / pageSize) > 5 && currentPage < Math.ceil(totalResultNum / pageSize) - 2 && <Pagination.Item onClick={() => setCurrentPage(Math.ceil(totalResultNum / pageSize))}>{Math.ceil(totalResultNum / pageSize)}</Pagination.Item>}
							<Pagination.Next onClick={onhandleNext} disabled={currentPage === Math.ceil(totalResultNum / pageSize)} />
						</div>
					</Pagination>
				</div>
			</div>
		</>
	)
}

export default PricePerformanceLeaderboard;