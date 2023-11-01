import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Dropdown from 'react-bootstrap/Dropdown';
import Pagination from 'react-bootstrap/Pagination';
import Modal from 'react-bootstrap/Modal';
import NumberInput from '../NumberInput/NumberInput';
import Button from 'react-bootstrap/Button';
import Spinner from 'react-bootstrap/Spinner';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCaretUp, faCaretDown } from '@fortawesome/free-solid-svg-icons';
import './style.css';

const Browse = () => {
	const [part, setPart] = useState(['CPU', 'CPUCooler', 'Motherboard', 'RAM', 'GPU', 'Storage', 'Tower', 'PSU'][useParams().id] || 'CPU');
	const [partsList, setPartsList] = useState([]);
	const [minPrice, setMinPrice] = useState(0);
	const [maxPrice, setMaxPrice] = useState(100000);
	const [orderBy, setOrderBy] = useState('price');
	const [orderDir, setOrderDir] = useState('ASC');
	const [listLoading, setListLoading] = useState(true);
	const [currentPage, setCurrentPage] = useState(1);
	const [showEllipseModal, setShowEllipseModal] = useState(false);
	const [enteredPage, setEnteredPage] = useState(1);
	const [totalResultNum, setTotalResultNum] = useState(0);

	const blacklist = ['partid', 'parttype', 'manufacturer', 'model', 'price'];
	const pageSize = 20;
	const { id } = useParams();
	let tableWidth = 3;

	useEffect(() => {
		onSubmit();
	}, []);

	useEffect(() => {
		onSubmit();
	}, [part, minPrice, maxPrice, orderBy, orderDir, currentPage]);



	const onChangePartType = (partType) => {
		setPart(partType);
		setCurrentPage(1);
	}

	const onChangeMinPrice = (minPrice) => {
		setMinPrice(minPrice);
		setCurrentPage(1);
	}

	const onChangeMaxPrice = (maxPrice) => {
		setMaxPrice(maxPrice);
		setCurrentPage(1);
	}

	const onSubmit = async () => {
		setListLoading(true);
		const url = "/api/browse";
		const data = {
			partType: part,
			minPrice: minPrice,
			maxPrice: maxPrice,
			orderBy: orderBy,
			orderDir: orderDir,
			pageNumber: currentPage,
			limitNumber: pageSize
		};
		let response;
		try {
			response = await axios.post(url, data);
			setPartsList(response?.data?.partslist);
			setTotalResultNum(response?.data?.totalResultNum);
			setListLoading(false);
		} catch (e) {
			console.log(e)
		}
	}

	const handleHeaderClick = (column) => {
		if (orderBy === column) {
			setOrderDir(orderDir === 'ASC' ? 'DESC' : 'ASC');
		} else {
			setOrderBy(column);
			setOrderDir('ASC');
		}
	};
	
	const renderSortArrow = (column) => {
		if (orderBy === column) {
			return <FontAwesomeIcon icon={orderDir === 'ASC' ? faCaretUp : faCaretDown} />;
		}
	};

	const renderTableHeaders = () => {
		if (partsList.length === 0) return null;
	
		const partKeys = Object.keys(partsList[0]);
	
		const filteredKeys = partKeys.filter(key => !blacklist.includes(key));
	
		tableWidth = filteredKeys.length + 3;

		return filteredKeys.map(key => (
			<th key={key}>
				{key.charAt(0).toUpperCase() + key.slice(1)}
			</th>
		));
	};
	
	const renderRowCells = (part) => {
		const partKeys = Object.keys(part);
	
		const filteredKeys = partKeys.filter(key => !blacklist.includes(key));
	
		return filteredKeys.map(key => (
			<td key={`${part.partid}-${key}`}>
				{part[key]}
			</td>
		));
	};

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

			<div className="p-1">
				<h1>
					Search for {part} parts
				</h1>
				<div>
					<div className="horizontal-group selection-list">
						{id && id < 8 && id >= 0 ?
							<></>
							:
							<div className="vertical-group">
								<p>
									Computer part:
								</p>
								<Dropdown>
									<Dropdown.Toggle variant="success" id="dropdown-basic">
										{part}
									</Dropdown.Toggle>

									<Dropdown.Menu>
										<Dropdown.Item onClick={() => onChangePartType('ALL')}>ALL</Dropdown.Item>
										<Dropdown.Item onClick={() => onChangePartType('CPU')}>CPU</Dropdown.Item>
										<Dropdown.Item onClick={() => onChangePartType('CPUCooler')}>CPUCooler</Dropdown.Item>
										<Dropdown.Item onClick={() => onChangePartType('Motherboard')}>Motherboard</Dropdown.Item>
										<Dropdown.Item onClick={() => onChangePartType('RAM')}>RAM</Dropdown.Item>
										<Dropdown.Item onClick={() => onChangePartType('GPU')}>GPU</Dropdown.Item>
										<Dropdown.Item onClick={() => onChangePartType('Storage')}>Storage</Dropdown.Item>
										<Dropdown.Item onClick={() => onChangePartType('Tower')}>Tower</Dropdown.Item>
										<Dropdown.Item onClick={() => onChangePartType('PSU')}>PSU</Dropdown.Item>
									</Dropdown.Menu>
								</Dropdown>
							</div>
						}
						<div className="vertical-group">
							<p>
								Price Range:
							</p>
							<div className="horizontal-group">
								<NumberInput enteredValue={minPrice} setEnteredValue={onChangeMinPrice} />
								<p>to</p>
								<NumberInput enteredValue={maxPrice} setEnteredValue={onChangeMaxPrice} />
							</div>
						</div>
					</div>

					<div className='table-scroll'>
						<table className="priceperformance-table">
							<thead>
								<tr>
									<th onClick={() => handleHeaderClick('manufacturer')} className="clickable">Manufacturer {renderSortArrow('manufacturer')}</th>
									<th onClick={() => handleHeaderClick('model')} className="clickable">Model {renderSortArrow('model')}</th>
									<th onClick={() => handleHeaderClick('price')} className="clickable">Price {renderSortArrow('price')}</th>
									{renderTableHeaders()}
								</tr>
							</thead>
							<tbody>
								{listLoading ?
									<tr className='row-hover'>
										<td className='table-spinner-container' colSpan={tableWidth}>
											<div className='table-spinner'>
												<Spinner animation="border" role="status">
													<span className="visually-hidden">Loading...</span>
												</Spinner>
											</div>
										</td>
									</tr>
									:
									<>
										{partsList.map((partl) => (
											<tr className='row-hover' key={partl.partid}>
												<td>{partl.manufacturer}</td>
												<td>{partl.model}</td>
												<td>{partl.price}</td>
												{renderRowCells(partl)}
											</tr>
										))}
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
			</div>
		</>
	)
}

export default Browse;