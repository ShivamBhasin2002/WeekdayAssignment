import React, { useEffect, useState, useRef, useCallback } from 'react';
import MultiSelectDropdown from './dropdown/MultiSelectDropdown';
import SingleSelectDropdown from './dropdown/SingleSelectDropdown';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import Popover from './popover/Popover';
import Button from '@mui/material/Button';
import { styled } from '@mui/material/styles';
import '../App.css';

// Limit for fetching job descriptions
const LIMIT = 5;

export default function SearchJobs() {
    // State variables
    const [jobDescriptions, setJobDescriptions] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const count = useRef(0);
    const observer = useRef(null);
    const [filters, setFilters] = useState({
        companyName: '',
        role: '',
        location: '',
        experience: '',
        minBasePay: ''
    });

    // Fetch job descriptions and update state
    const fetchAndSetJobDescriptions = useCallback(
        async () => {
            setIsLoading(true);
            const data = await fetchData(LIMIT * count.current);
            setIsLoading(false);
            if (data === null) {
                setError(true);
                return;
            }
            setJobDescriptions(prev => removeDuplicates([...prev, ...data.jdList], 'jdUid'));
            count.current = count.current + 1;
        },
        []
    );

    // Intersection Observer API to fetch more job descriptions
    const lastJobRef = useCallback(node => {
        if (isLoading) return;
        if (observer.current) observer.current.disconnect();
        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting) {
                fetchAndSetJobDescriptions();
            }
        });
        if (node) observer.current.observe(node);
    }, [isLoading, fetchAndSetJobDescriptions]);

    // Handle selection change in dropdowns
    const handleSelectionChange = (selectedItems, type) => {
        if (type === 'role') {
            setFilters(prevFilters => ({
                ...prevFilters,
                role: selectedItems
            }));
        } else if (type === 'location') {
            setFilters(prevFilters => ({
                ...prevFilters,
                location: selectedItems
            }));
        } else if (type === 'experience') {
            setFilters(prevFilters => ({
                ...prevFilters,
                experience: selectedItems
            }));
        } else if (type === 'basePay') {
            // Remove 'L' from the selectedItems before setting the filter
            const cleanedSelectedItems = selectedItems.replace('L', '');
            // console.log(cleanedSelectedItems);
            setFilters(prevFilters => ({
                ...prevFilters,
                minBasePay: cleanedSelectedItems
            }));
        }
    };

    // Fetch job descriptions on component mount
    useEffect(() => {
        fetchAndSetJobDescriptions();
    }, []);

    // Return error message if there's an error
    if (error) {
        return <p>Error: {error}</p>;
    }


    // Function to filter job descriptions based on filters
    const filterJobs = () => {
        let filteredJobs = jobDescriptions.filter(job => {
            return (
                // Filter by CompanyName
                job.companyName.toLowerCase().includes(filters.companyName.toLowerCase()) &&

                // Filter by Role
                (filters.role.length === 0 || filters.role.some(selectedRole => selectedRole.toLowerCase() === job.jobRole.toLowerCase())) &&

                // Filter by location
                (filters.location.length === 0 || filters.location.some(selectedLocation => selectedLocation.toLowerCase() === job.location.toLowerCase())) &&

                // Filter by experience
                (filters.experience === '' || (parseInt(filters.experience) >= job.minExp && parseInt(filters.experience) <= job.maxExp)) &&

                // Filter by minimum base pay
                (filters.minBasePay === '' ||
                    (parseInt(job.maxJdSalary) >= parseInt(filters.minBasePay)))
            );
        });
        return filteredJobs;
    };

    // Handle filter change
    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prevFilters => ({
            ...prevFilters,
            [name]: value
        }));
    };

    return (
        <div className="mt-10 mb-20">
            <div className="w-full px-20 lg:px-48 gap-2">
                <div className="flex flex-wrap">
                    {/* Dropdowns for filtering */}
                    <MultiSelectDropdown onSelectionChange={(selectedItems) => handleSelectionChange(selectedItems, 'role')} list={roleList} label="Roles" />
                    <SingleSelectDropdown onSelectionChange={(selectedItems) => handleSelectionChange(selectedItems, 'employees')} list={employeesList} label="Number of Employees" />
                    <SingleSelectDropdown onSelectionChange={(selectedItems) => handleSelectionChange(selectedItems, 'experience')} list={experienceList} label="Experience" />
                    <MultiSelectDropdown onSelectionChange={(selectedItems) => handleSelectionChange(selectedItems, 'location')} list={locationList} label="Remote" />
                    <SingleSelectDropdown onSelectionChange={(selectedItems) => handleSelectionChange(selectedItems, 'basePay')} list={basePayList} label="Minimum Base Pay Salary" />

                    {/* Text field for company name filter */}
                    <div className="m-1">
                        <TextField label="Company Name" variant="outlined" size="small"
                            type="text"
                            id="companyName" name="companyName"
                            value={filters.companyName} onChange={handleFilterChange} />
                    </div>
                </div>
            </div>

            {/* Display filtered jobs */}
            <div className="w-full px-5 lg:px-10 py-10 ">
                <div className="flex flex-wrap gap-10 items-center justify-center text-black">

                    {/* Return message if no job descriptions found */}
                    {!isLoading && filterJobs().length === 0 &&
                        <div className="">
                            <img className="mx-10" src="/assets/images/nothing-found.png" alt="Not Found" width={300} height={300} />
                            <p>No Jobs available for this category at the moment</p>
                        </div>
                    }

                    {/* Display job cards */}
                    {filterJobs().map((list, index) => (
                        <div ref={index === filterJobs().length - 1 ? lastJobRef : null} key={list.jdUid}
                            className="bg-white shadow-xl border rounded-xl min-w-[20rem] min-h-[30rem] p-4 flex flex-col items-start gap-2">

                            <div>
                                <p className="px-1 py-1 rounded-lg border text-[9px] font-normal bg-white ">
                                    ⏳ Posted {getRandomNumber(3, 25)} days ago
                                </p>
                            </div>

                            <div className="flex items-center gap-2">
                                <div>
                                    <img src={list.logoUrl} width={50} height={100} />
                                </div>
                                <div className="flex flex-col items-start">
                                    <h3 className="text-[13px] font-semibold mb-1 text-[#8b8b8b] tracking-[1px]">
                                        {list.companyName}
                                    </h3>
                                    <h2 className="text-sm leading-normal mb-1">
                                        {capitalizeWords(list.jobRole)}
                                    </h2>
                                    <p className="text-[11px]">{capitalizeWords(list.location)}</p>
                                </div>
                            </div>
                            <div>
                                <p className="text-sm leading-normal text-[#4D596A]">
                                    Estimated Salary: ₹{list.minJdSalary !== null ? list.minJdSalary : '0'}
                                    - {list.maxJdSalary} LPA
                                    <span className="pl-1">
                                        <Tooltip title="Offered salary range" placement="top">
                                            <span>✅</span>
                                        </Tooltip>
                                    </span>
                                </p>
                            </div>
                            <div>
                                <p className="font-semibold	text-base">About company:</p>
                            </div>

                            <div className="h-64" style={{ overflow: "hidden", maskImage: "linear-gradient(rgb(255, 255, 255), rgb(255, 255, 255), rgba(255, 255, 255, 0))" }}	>
                                <p className="text-sm font-black">About Us</p>
                                <p className="max-w-[300px] text-sm text-justify font-normal	">{list.jobDetailsFromCompany}</p>
                            </div>

                            <div className="w-full text-center">
                                <Popover desc={list.jobDetailsFromCompany} />
                            </div>

                            <div className="flex flex-col items-start justify-center">
                                <p className="text-[13px] font-black text-[#8B8B8B] ">Minimum Experience</p>
                                <p className="text-sm font-normal	">{list.minExp !== null ? `${list.minExp} years` : '0 years'}</p>
                            </div>

                            <ColorButton className="px-6 py-2 text-base text-black font-bold w-full mt-5 rounded-md" variant="contained">⚡️ Easy Apply</ColorButton>
                        </div>
                    ))}
                </div>
            </div>

            {isLoading &&
                // <div className="" id="loading-bar-spinner" class="spinner"><div class="spinner-icon"></div></div>
                <p>Loading...</p>
            }
        </div>
    );
}

// Fetch data from API
const fetchData = async (offset) => {
    try {
        const myHeaders = new Headers();
        myHeaders.append('Content-Type', 'application/json');
        const body = JSON.stringify({
            limit: LIMIT,
            offset: offset,
        });
        const requestOptions = {
            method: 'POST',
            headers: myHeaders,
            body,
        };
        const response = await fetch("https://api.weekday.technology/adhoc/getSampleJdJSON", requestOptions);
        if (!response.ok) {
            return null;
        }
        return await response.json();
    } catch (error) {
        console.error("Fetch error:", error);
        return null;
    }
};

// Remove duplicate job descriptions
const removeDuplicates = (array, key) => {
    const uniqueKeys = new Set();
    return array.filter(obj => {
        const keyValue = obj[key];
        if (!uniqueKeys.has(keyValue)) {
            uniqueKeys.add(keyValue);
            return true;
        }
        return false;
    });
};

// Dropdown list data
const roleList = ['FrontEnd', 'BackEnd', 'IOS', 'Android'];
const locationList = ['Remote', 'Mumbai', 'Bangalore', 'Delhi NCR'];
const experienceList = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'];
const employeesList = ['1-10', '11-20', '21-50', '51-100', '101-200', '201-500', '500+'];
const basePayList = ['0L', '10L', '20L', '30L', '40L', '50L', '60L', '70L'];

// Function to get random number
function getRandomNumber(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Function to capitalize words
function capitalizeWords(str) {
    return str.replace(/\b\w/g, function (char) {
        return char.toUpperCase();
    });
}

// Styled button component
const ColorButton = styled(Button)(({ theme }) => ({
    color: theme.palette.getContrastText('#55efc4'),
    backgroundColor: '#55efc4',
    '&:hover': {
        backgroundColor: '#55efc4',
    },
}));