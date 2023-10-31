import React, { useEffect, useState } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import './style.css';

const Lists = () => {
    const [userLists, setUserLists] = useState([]);

    useEffect(() => {
        getLists();
    }, []);

    const getLists = async () => {
        const url = "/api/lists";
        let response;
        try {
            response = await axios.get(url);
            setUserLists(response?.data);
        } catch {
            console.error("Error fetching lists");
        }
    }

	return (
		<>
			<div className="p-1">
				<h1>
					Your lists
				</h1>
				<div>
					<div className="horizontal-group selection-list">
                        {userLists.map((list) => (
                            <div key={list._id} className="list-item">
                                <div className="list-item-name">
                                    {list.name}
                                </div>
                                <div className="list-item-description">
                                    {list.description}
                                </div>
                            </div>
                        ))}
					</div>
				</div>
			</div>
		</>
	)
}

export default Lists;