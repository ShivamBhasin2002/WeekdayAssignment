import * as React from 'react';
import { useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import OutlinedInput from '@mui/material/OutlinedInput';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import Chip from '@mui/material/Chip';
import { styled } from '@mui/material/styles';

// Constants for menu height and padding
const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
// Menu props to control the style of the dropdown menu
const MenuProps = {
    PaperProps: {
        style: {
            maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
            width: 250,
        },
    },
};

// Function to determine the font weight based on selection
function getStyles(name, multiSelectedItem, theme) {
    return {
        fontWeight:
            multiSelectedItem.indexOf(name) === -1
                ? theme.typography.fontWeightRegular
                : theme.typography.fontWeightMedium,
    };
}

export default function MultiSelectDropdown({ onSelectionChange, list, label }) {
    const theme = useTheme();
    const [multiSelectedItem, setMultiSelectedItem] = React.useState([]);

    // Handle change in selection
    const handleChange = (event) => {
        const {
            target: { value },
        } = event;

        // On autofill we get a stringified value.
        const selectedNames = typeof value === 'string' ? value.split(',') : value;
        setMultiSelectedItem(selectedNames);
        // Call the callback function with the selected names
        onSelectionChange(selectedNames);
    };

    // Handle deletion of a selected item
    const handleDelete = (chipToDelete) => {
        const updatedSelection = multiSelectedItem.filter((name) => name !== chipToDelete);
        setMultiSelectedItem(updatedSelection);
        onSelectionChange(updatedSelection);
    };
    // console.log("After Deleting: ", multiSelectedItem);

    return (
        <div>
            {/* Customized FormControl */}
            <NewFormControl sx={{ m: 0.5 }} size="small">
                {/* Input label */}
                <InputLabel id="demo-multiple-chip-label">{label}</InputLabel>
                {/* Select component */}
                <Select
                    labelId="demo-multiple-chip-label"
                    id="demo-multiple-chip"
                    multiple
                    value={multiSelectedItem}
                    onChange={handleChange}
                    label={label}
                    input={<OutlinedInput id="select-multiple-chip" label={label} />}
                    renderValue={(selected) => (
                        // Render selected items as Chips
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                            {selected.map((value) => (
                                <Chip
                                    key={value}
                                    label={value}
                                    onDelete={() => handleDelete(value)}
                                    onMouseDown={(event) => {
                                        // Prevent opening the popup when clicking on the Chip
                                        event.stopPropagation();
                                    }}
                                />
                            ))}
                        </Box>
                    )}
                    MenuProps={MenuProps} // Apply custom menu props
                >
                    {/* Render menu items */}
                    {list.map((name) => (
                        <MenuItem
                            key={name}
                            value={name}
                            style={getStyles(name, multiSelectedItem, theme)}
                        >
                            {name}
                        </MenuItem>
                    ))}
                </Select>
            </NewFormControl>
        </div>
    );
}

// Styled FormControl for consistent styling
const NewFormControl = styled(FormControl)(({ theme }) => ({
    margin: theme.spacing(1),
    minWidth: 150, // Set min width
    maxWidth: 400, // Set max width
}));