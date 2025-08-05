let acked = false;
function ack() {
    if (acked) {
        return;
    }
    const info = document.getElementById('info');
    info.style.height = 'auto';
    info.style.overflowY = null;
    if (info.classList.contains('main')) {
        document.getElementById('okay').style.display = 'none';
    } else {
        document.getElementById('warning').style.display = 'none';
    }
    acked = true;
}

function syn() {
    document.getElementById('warning').style.display = '';
    if (localStorage.getItem('nightreign.ack') === '1') {
        ack();
    }
}

function updateSort() {
    const idsort = document.getElementById('sortid').checked;
    document.getElementById('idgrid').style.display = idsort ? '' : 'none';
    document.getElementById('spawngrid').style.display = !idsort ? '' : 'none';
    
    const earthFilterGroup = document.querySelector('.filter-group.earth-filter');
    if (earthFilterGroup) {
        earthFilterGroup.style.display = !idsort ? 'flex' : 'none';
    }
    
    localStorage.setItem('nightreign.sort', idsort ? 'id' : 'spawn');
    
    if (!idsort) {
        updateEarthFilter();
    }
}

function updateEarthFilter() {
    const filter = document.getElementById('earthFilter');
    if (!filter) {
      return;
    }
    
    const selectedValue = filter.value;
    const spawnsets = document.querySelectorAll('.spawnset');
    
    spawnsets.forEach(spawnset => {
        const legend = spawnset.querySelector('legend').textContent;
        let shouldShow = true;
        
        if (selectedValue === 'none') {
            shouldShow = !legend.includes('(Mountaintop)') && 
                        !legend.includes('(Crater)') && 
                        !legend.includes('(Rotted Woods)') && 
                        !legend.includes('(Noklateo)');
        } else if (selectedValue === 'mountaintop') {
            shouldShow = legend.includes('(Mountaintop)');
        } else if (selectedValue === 'crater') {
            shouldShow = legend.includes('(Crater)');
        } else if (selectedValue === 'rotted-woods') {
            shouldShow = legend.includes('(Rotted Woods)');
        } else if (selectedValue === 'noklateo') {
            shouldShow = legend.includes('(Noklateo)');
        }
        
        spawnset.style.display = shouldShow ? '' : 'none';
    });
    
    localStorage.setItem('nightreign.earthFilter', selectedValue);
}

function selectSort() {
    document.getElementById('sortid').addEventListener('change', updateSort);
    document.getElementById('sortspawn').addEventListener('change', updateSort);
    
    const earthFilter = document.getElementById('earthFilter');
    if (earthFilter) {
        earthFilter.addEventListener('change', updateEarthFilter);
        const savedFilter = localStorage.getItem('nightreign.earthFilter');
        if (savedFilter) {
            earthFilter.value = savedFilter;
        }
    }
    
    const nightlordFilter = document.getElementById('nightlordFilter');
    if (nightlordFilter) {
        nightlordFilter.addEventListener('change', function() {
            const selectedNightlord = this.value;
            window.location.href = `../${selectedNightlord}/`;
        });
    }
    
    const pref = localStorage.getItem('nightreign.sort');
    if (pref === 'id') {
        document.getElementById('sortid').checked = true;
    } else if (pref === 'spawn') {
        document.getElementById('sortspawn').checked = true;
    }
    updateSort();
}

function toggleZoom() {
    const root = document.getElementById('root');
    root.classList.toggle('zoomimage');
}

window.addEventListener('load', function () {
    document.getElementById('ack').addEventListener('click', function() {
        localStorage.setItem('nightreign.ack', '1');
        ack();
    });
    const zoom = document.getElementById('zoom');
    if (zoom) {
        zoom.addEventListener('click', toggleZoom);
    }
});

window.addEventListener('storage', (e) => {
    if (e.key === 'nightreign.ack' && e.newValue === '1') {
        ack();
    }
});
