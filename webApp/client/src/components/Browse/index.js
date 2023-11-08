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
import { faCaretUp, faCaretDown, faPlus } from '@fortawesome/free-solid-svg-icons';
import Slider from '@mui/material/Slider';
import OutlinedInput from '@mui/material/OutlinedInput';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import ListItemText from '@mui/material/ListItemText';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import Checkbox from '@mui/material/Checkbox';
import Chip from '@mui/material/Chip';
import './style.css';

const Browse = () => {
	const [part, setPart] = useState(['CPU', 'CPUCooler', 'Motherboard', 'RAM', 'GPU', 'Storage', 'Tower', 'PSU'][useParams().id] || 'CPU');
	const [partsList, setPartsList] = useState([]);
	const [minPrice, setMinPrice] = useState(0);
	const [maxPrice, setMaxPrice] = useState(10000);
	const [intermediateMinPrice, setIntermediateMinPrice] = useState(0);
	const [intermediateMaxPrice, setIntermediateMaxPrice] = useState(10000);
	const [minPriceRange, setMinPriceRange] = useState(0);
	const [maxPriceRange, setMaxPriceRange] = useState(10000);
	const [orderBy, setOrderBy] = useState('price');
	const [orderDir, setOrderDir] = useState('ASC');
	const [listLoading, setListLoading] = useState(true);
	const [currentPage, setCurrentPage] = useState(1);
	const [showEllipseModal, setShowEllipseModal] = useState(false);
	const [enteredPage, setEnteredPage] = useState(1);
	const [totalResultNum, setTotalResultNum] = useState(0);
	const [addingPartId, setAddingPartId] = useState(null);
	const [manufacturerMenuProps, setManufacturerMenuProps] = useState([]);
	const [selectedManufacturers, setSelectedManufacturers] = useState([]);

	const blacklist = ['partid', 'parttype', 'manufacturer', 'model', 'price', 'chipsetid'];
	const pageSize = 20;
	const { id } = useParams();
	const listid = new URLSearchParams(window.location.search).get('listid') || null;
	let tableWidth = 3;
	const MenuProps = {
		PaperProps: {
			style: {
			maxHeight: 48 * 4.5 + 8,
			width: 250,
			},
		},
	};

	useEffect(() => {
		fetchMenuItems();
		onSubmit();
	}, []);

	useEffect(() => {
		fetchMenuItems();
	}, [part]);

	useEffect(() => {
		setCurrentPage(1);
	}, [selectedManufacturers]);

	useEffect(() => {
		onSubmit();
	}, [part, minPrice, maxPrice, orderBy, orderDir, currentPage, selectedManufacturers]);


	const fetchMenuItems = async () => {
		const url = "/api/browse/menu";
		const data = {
			partType: part
		};
		let response;
		try {
			response = await axios.post(url, data);
			setManufacturerMenuProps(response?.data?.categorical.manufacturers);
			setMinPriceRange(response?.data?.numerical.price[0]);
			setMaxPriceRange(response?.data?.numerical.price[1]);
			setIntermediateMinPrice(response?.data?.numerical.price[0]);
			setIntermediateMaxPrice(response?.data?.numerical.price[1]);
			setMinPrice(response?.data?.numerical.price[0]);
			setMaxPrice(response?.data?.numerical.price[1]);
			console.log(response?.data)
			setListLoading(false);
		} catch (e) {
			console.log(e)
		}
	}

	const onChangePartType = (partType) => {
		setPart(partType);
		setCurrentPage(1);
	}

	const handleChangeMinMaxPrice = (event, newValue) => {
		setIntermediateMinPrice(newValue[0]);
		setIntermediateMaxPrice(newValue[1]);
		setCurrentPage(1);
	};

	const onSubmitPrice = () => {
		setMinPrice(intermediateMinPrice);
		setMaxPrice(intermediateMaxPrice);
		setCurrentPage(1);
	}

	const onSubmit = async () => {
		setListLoading(true);
		const url = "/api/browse";
		const data = {
			partType: part,
			minPrice: minPrice,
			maxPrice: maxPrice,
			manufacturers: selectedManufacturers,
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

	const addPartToList = async (partId) => {
        setAddingPartId(partId);
        try {
            await axios.post(`/api/addpart/${listid}`, { partid: partId });
            window.location.href = `/build/${listid}`;
        } catch (e) {
            console.error(e);
            setAddingPartId(null);
        }
    };

	const renderTableHeaders = () => {
        const headers = partsList.length > 0 ? Object.keys(partsList[0]) : [];
        const filteredHeaders = headers.filter(key => !blacklist.includes(key));

        tableWidth = listid ? filteredHeaders.length + 4 : filteredHeaders.length + 3;

        return (
            <>
                {filteredHeaders.map(key => (
                    <th key={key} >
                        {key.charAt(0).toUpperCase() + key.slice(1)} {renderSortArrow(key)}
                    </th>
                ))}
                {listid && <th></th>}
            </>
        );
    };
	
	const renderRowCells = (part) => {
        const partKeys = Object.keys(part);
        const filteredKeys = partKeys.filter(key => !blacklist.includes(key));

        return (
            <>
                {filteredKeys.map(key => (
                    <td key={`${part.partid}-${key}`}>
                        {part[key]}
                    </td>
                ))}
                {listid && (
                    <td>
                        {addingPartId === part.partid ? (
                            <Spinner animation="border" role="status" style={{color: '#007bff'}}>
                                <span className="visually-hidden">Adding...</span>
                            </Spinner>
                        ) : (
                            <Button variant="link" onClick={() => addPartToList(part.partid)} title='Add part to list'>
                                <FontAwesomeIcon icon={faPlus} />
                            </Button>
                        )}
                    </td>
                )}
            </>
        );
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
				<div className="filters-table">
					<div className="selection-list">
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
										<Dropdown.Item onClick={() => onChangePartType('All')}>All</Dropdown.Item>
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
						<div className="vertical-group slider">
							<p>
								Price: ${minPrice} - ${maxPrice}
							</p>
							<div className="horizontal-group slider">
								<Slider
									value={[intermediateMinPrice, intermediateMaxPrice]}
									onChange={handleChangeMinMaxPrice}
									onChangeCommitted={onSubmitPrice}
									valueLabelDisplay="auto"
									aria-labelledby="range-slider"
									className='slider'
									getAriaValueText={() => `${intermediateMinPrice} - ${intermediateMaxPrice}`}
									min={minPriceRange}
									max={maxPriceRange}
								/>
							</div>
						</div>
						<div className="vertical-group">
							<p>
								Select Manufacturer(s):
							</p>
							<FormControl sx={{ m: 1, width: 300 }}>
								<InputLabel id="demo-multiple-checkbox-label">Manufacturer(s)</InputLabel>
								<Select
									labelId="demo-multiple-checkbox-label"
									id="demo-multiple-checkbox"
									multiple
									value={selectedManufacturers}
									onChange={(event) => setSelectedManufacturers(event.target.value)}
									input={<OutlinedInput label="Manufacturer(s)" />}
									renderValue={(selected) => (
										<div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
											{selected.map((value) => (
												<Chip key={value} label={value} />
											))}
										</div>
									)}
									MenuProps={MenuProps}
								>
									{manufacturerMenuProps.map((name) => (
										<MenuItem key={name} value={name}>
											<Checkbox checked={selectedManufacturers.indexOf(name) > -1} />
											<ListItemText primary={name} />
										</MenuItem>
									))}
								</Select>
							</FormControl>
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