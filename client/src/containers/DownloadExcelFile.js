import React, { useEffect, useState, useContext } from 'react';
import { Navigate } from "react-router-dom";
import axios from 'axios';
import * as XLSX from 'xlsx';

import styled from 'styled-components'
import PageHeader from '../components/PageHeader'
import MappingList from '../components/MappingList';
import PopUpModal from '../components/PopUpModal';

import MappingService from '../services/MappingService';
import { Ctx } from '../components/StateProvider';


const Form = styled.div`
    padding: 15px 50px;

    label {
        font-family: 'Concert One', sans-serif;
        font-size: 40px;
    }
`

const ListContainer = styled.div`
    font-family: 'Courier Prime', monospace;
    font-size: 20px;
    padding: 1em 0;
    width: 70%;
    height: 90vh;
    overflow-y: auto;

    div {
        padding-bottom: 2em;
    }
`

const SubmitButton = styled.button`
    padding: 5px;
    width: 10vw;
    border-radius: 20px;
    background-color: #39B045;
    color: white;
    font-size: 30px;
    font-family: 'Concert One', sans-serif;
    border: 2px solid black;
    cursor: pointer;
`

const initialModal = {
    show: false,
    success: true,
    successText: '',
    errorText: '',
}

const DownloadExcelFile = () => {
    const [modal, setModal] = useState(initialModal);
    const [mappings, setMappings] = useState([]);
    const [checked, setChecked] = useState([]);

    useEffect(() => {
        fetchMappings();
    }, [])

    const { state } = useContext(Ctx);

    const fetchMappings = async () => {
        try {
          const res = await MappingService.getAllMappings();
          setMappings(res)
        } catch(e) {
          console.log(e);
          setModal((prev) => ({
            ...prev,
            show: true,
            success: false,
            errorText: 'An error occurred trying to fetch the mappings',
          }))
        }
    }

    const closeModal = () => setModal(initialModal)

      
    // Add/Remove checked item from list
    const handleCheck = (event) => {
        var updatedList = [...checked];
        if (event.target.checked) {
            updatedList = [...checked, event.target.value];
        } else {
            updatedList.splice(checked.indexOf(event.target.value), 1);
        }
        setChecked(updatedList);
    };

    // TODO: send mappings to endpoint and get Excel file from endpoint
    const handleSubmit = async (e) => {
        console.log(checked)
    
        // Send selected mappings list to the server
        await axios.post('/tables/download', checked)
            .then(response => response.json())
            .then(data => {
                // Convert data to worksheet
                const ws = XLSX.utils.json_to_sheet(data);

                // Create a workbook with a single sheet
                // TODO: need to make multiple sheets
                const wb = XLSX.utils.book_new();
                XLSX.utils.book_append_sheet(wb, ws, 'Sheet 1');

                // Create a Blob from the workbook
                const fileBlob = XLSX.write(wb, { bookType: 'xlsx', type: 'blob' });

                // Create a blob URL for the file
                const fileUrl = URL.createObjectURL(fileBlob);

                // Create an anchor element to trigger download
                const downloadLink = document.createElement('a');
                downloadLink.href = fileUrl;
                downloadLink.download = 'data.xls'; // Set the file name

                // Append the anchor to the body and trigger the download
                document.body.appendChild(downloadLink);
                downloadLink.click();

                // Remove the anchor element from the body
                document.body.removeChild(downloadLink);
                URL.revokeObjectURL(fileUrl);
            

            setModal((prev) => ({
                ...prev,
                show: true,
                success: true,
                successText: 'Successfully created Excel file to download',
            }))
        })
        .catch (error => {
            console.log(error);
            setModal((prev) => ({
                ...prev,
                show: true,
                success: false,
                errorText: 'An error occurred trying to fetch the data',
            }))
        });
    };

    if (state.user === null) {
        return <Navigate to="/" replace />;
    }
    
    return (
        <div>
            <PageHeader title={"Download Excel File from Knowledge Base"} />
            <Form>
                <form onSubmit={handleSubmit}>
                    <label htmlFor="mapping-selection"> Select Mappings </label>
                    <ListContainer>
                        {mappings.map((item, index) => (
                            <div key={index}>
                                <input 
                                    key={item.uuid} 
                                    value={item.read_query} 
                                    type="checkbox" 
                                    onChange={handleCheck} />
                                <span> {item.read_query} </span>
                            </div>
                        ))}
                    </ListContainer>
                </form>

                <SubmitButton type="submit" onClick={handleSubmit}>
                    Submit
                </SubmitButton>
            </Form>
        </div>
    )
}

export default DownloadExcelFile;