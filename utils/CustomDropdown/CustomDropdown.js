import React from 'react';
import { Menu } from '@mui/material';
import './CustomDropdown.css';

const CustomDropdown = ({ anchorEl, open, onClose, children, width=300 }) => (
  <Menu
    anchorEl={anchorEl}
    open={open}
    onClose={onClose}
    slotProps={{
      list: {
        'aria-labelledby': 'basic-button',
        className: 'custom-dropdown-list'
      },
      paper: {
        className: 'custom-dropdown-paper',
        sx: { width: width ? `${width}px` : 'auto', minWidth: width ? `${width}px` : '150px' }
      }
    }}
    transformOrigin={{ horizontal: 'right', vertical: 'top' }}
    anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
  >
    {children}
  </Menu>
);

export default CustomDropdown;
