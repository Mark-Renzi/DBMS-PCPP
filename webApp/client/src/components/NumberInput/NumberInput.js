import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMinus, faPlus } from '@fortawesome/free-solid-svg-icons';
import './NumberInput.css';

function NumberInput({enteredValue, setEnteredValue, onHandleSubmit}) {

    const handleMinus = () => {
        setEnteredValue(prevPage => Math.max(prevPage - 1, 1)); // considering minimum page is 1
    }

    const handlePlus = () => {
        setEnteredValue(prevPage => prevPage + 1);
    }

    const handleQuantityChange = (event) => {
        setEnteredValue(Math.max(Number(event.target.value), 1)); // considering minimum page is 1
    }

    const handleSubmit = (event) => {
        event.preventDefault();  // prevent default form submission action
        if (onHandleSubmit !== undefined) {
            onHandleSubmit(event);
        }
    }

    return (
        <div className="input-group">
            <div className="input-group-prepend">
                <button className="btn btn-outline-secondary btn-minus" onClick={handleMinus}>
                    <FontAwesomeIcon icon={faMinus}/>
                </button>
            </div>
            <form onSubmit={handleSubmit}>
                <input className="form-control quantity input-field" min="1" name="quantity" value={enteredValue} type="number" onChange={handleQuantityChange}/>
            </form>
            <div className="input-group-append">
                <button className="btn btn-outline-secondary btn-plus" onClick={handlePlus}>
                    <FontAwesomeIcon icon={faPlus}/>
                </button>
            </div>
        </div>
    )
}

export default NumberInput;
