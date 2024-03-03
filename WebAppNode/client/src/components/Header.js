import React from 'react';
import Logo from '../utils/img/logo.png'
import '../utils/css/styles.css'
function Header() {
  return (
    <div style={headerStyle} >
      <img src={Logo} width="50" height="30" />    </div>
  );
}

const headerStyle = {
  backgroundColor: 'white',
  display: 'flex',
  alignItems: 'center',
  height: '50px',
  paddingLeft: '20px',
  width:'100%',

};


export default Header;
