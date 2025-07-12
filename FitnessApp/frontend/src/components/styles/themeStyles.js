const orangeColor = '#e37243';
const orangeHover = '#db5c35';

export const inputStyles = {
  width: '100%',
  '& .MuiOutlinedInput-root': {
    '&.Mui-focused fieldset': {
      borderColor: `${orangeColor} !important`,
    },
    '&:hover fieldset': {
      borderColor: orangeColor,
    },
  },
  '& .MuiInputLabel-root.Mui-focused': {
    color: `${orangeColor} !important`,
  },
  '& .MuiSvgIcon-root': {
    color: orangeColor,
  },
  '& .MuiOutlinedInput-notchedOutline': {
    borderColor: '#ccc',
  },
  '& .Mui-focused .MuiOutlinedInput-notchedOutline': {
    borderColor: `${orangeColor} !important`,
  }
};

export const autocompleteStyles = {
  width: '100%',
  '& .MuiAutocomplete-inputRoot': {
    padding: '8.5px 14px',
    '&.Mui-focused fieldset': {
      borderColor: `${orangeColor} !important`,
    },
    '&:hover fieldset': {
      borderColor: orangeColor,
    },
  },
  '& .MuiInputLabel-root.Mui-focused': {
    color: `${orangeColor} !important`,
  },
  '& .MuiAutocomplete-popupIndicator': {
    color: orangeColor,
    '&:hover': {
      color: orangeHover,
    }
  },
  '& .MuiAutocomplete-clearIndicator': {
    color: orangeColor,
    '&:hover': {
      color: orangeHover,
    }
  },
};

export const dateTimePickerStyles = {
  width: '100%',
  '& .MuiInputBase-root': {
    '&.Mui-focused fieldset': {
      borderColor: `${orangeColor} !important`,
    },
    '&:hover fieldset': {
      borderColor: orangeColor,
    },
  },
  '& .MuiInputLabel-root.Mui-focused': {
    color: `${orangeColor} !important`,
  },
  '& .MuiIconButton-root': {
    color: orangeColor,
    '&:hover': {
      color: orangeHover,
    }
  },
};

export const searchInputStyles = {
  flexGrow: 1,
  maxWidth: '400px',
  '& .MuiOutlinedInput-root': {
    borderRadius: '20px',
    '&.Mui-focused fieldset': {
      borderColor: `${orangeColor} !important`,
    },
    '&:hover fieldset': {
      borderColor: orangeColor,
    },
  },
  '& .MuiInputLabel-root.Mui-focused': {
    color: `${orangeColor} !important`,
  },
  '& .MuiSvgIcon-root': {
    color: orangeColor,
  },
};

export const datePickerStyles = {
  width: '200px',
  '& .MuiOutlinedInput-root': {
    '&.Mui-focused fieldset': {
      borderColor: `${orangeColor} !important`,
    },
    '&:hover fieldset': {
      borderColor: orangeColor,
    },
  },
  '& .MuiInputLabel-root.Mui-focused': {
    color: `${orangeColor} !important`,
  },
  '& .MuiSvgIcon-root': {
    color: orangeColor,
  },
};
