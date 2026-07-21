import React from 'react';

const Dice = ({ val, size = 50 }) => {
    // Custom CSS Dice to match visuals (Red bg, white dots)
    const dotsMap = {
        1: ['center'],
        2: ['top-left', 'bottom-right'],
        3: ['top-left', 'center', 'bottom-right'],
        4: ['top-left', 'top-right', 'bottom-left', 'bottom-right'],
        5: ['top-left', 'top-right', 'center', 'bottom-left', 'bottom-right'],
        6: ['top-left', 'top-right', 'middle-left', 'middle-right', 'bottom-left', 'bottom-right']
    };

    const dots = dotsMap[val] || [];
    const dotSize = size / 5;

    return (
        <div style={{
            width: `${size}px`, 
            height: `${size}px`, 
            background: '#bd1828', 
            borderRadius: `${size/7.5}px`, 
            position: 'relative',
            boxShadow: 'inset 0 0 5px rgba(0,0,0,0.2)',
            display: 'inline-block'
        }}>
           {dots.map((pos, i) => {
               let style = { 
                   position: 'absolute', 
                   width: `${dotSize}px`, 
                   height: `${dotSize}px`, 
                   background: 'white', 
                   borderRadius: '50%' 
               };
               
               if (pos === 'center') { style.top = '50%'; style.left = '50%'; style.transform = 'translate(-50%, -50%)'; }
               if (pos === 'top-left') { style.top = '15%'; style.left = '15%'; }
               if (pos === 'top-right') { style.top = '15%'; style.right = '15%'; }
               if (pos === 'bottom-left') { style.bottom = '15%'; style.left = '15%'; }
               if (pos === 'bottom-right') { style.bottom = '15%'; style.right = '15%'; }
               if (pos === 'middle-left') { style.top = '50%'; style.left = '15%'; style.transform = 'translateY(-50%)'; }
               if (pos === 'middle-right') { style.top = '50%'; style.right = '15%'; style.transform = 'translateY(-50%)'; }
               
               return <div key={i} style={style}></div>
           })}
        </div>
    )
}

export default Dice;
