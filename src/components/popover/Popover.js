import * as React from 'react';
import Popover from '@mui/material/Popover';

export default function JobPopover(desc) {
    // State for anchor element
    const [anchorEl, setAnchorEl] = React.useState(null);

    // Open popover
    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    // Close popover
    const handleClose = () => {
        setAnchorEl(null);
    };

    // Determine if popover is open
    const open = Boolean(anchorEl);
    const id = open ? 'simple-popover' : undefined;

    // console.log(desc.desc);
    return (
        <div>
            {/* Show more text to open popover */}
            <p className="text-base text-[#5751DD] cursor-pointer" aria-describedby={id} variant="contained" onClick={handleClick}>
                Show more
            </p>
            {/* Popover component */}
            <Popover
                id={id}
                open={open}
                // anchorEl={anchorEl}
                anchorReference={"none"}
                sx={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                }}
                onClose={handleClose}
                anchorOrigin={{
                    vertical: 'center',
                    horizontal: 'center',
                }}
                transformOrigin={{
                    vertical: 'center',
                    horizontal: 'center',
                }}
            >
                {/* Popover content */}
                <div>
                    <h1 className="text-center text-xl font-black mt-3">Job Description:</h1>
                </div>
                <p className="w-[45rem] px-5 py-3 mb-3 text-justify">{desc.desc}</p>
            </Popover>
        </div>
    );
}
