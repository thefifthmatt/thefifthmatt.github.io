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
    localStorage.setItem('nightreign.sort', idsort ? 'id' : 'spawn');
}

function selectSort() {
    document.getElementById('sortid').addEventListener('change', updateSort);
    document.getElementById('sortspawn').addEventListener('change', updateSort);
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
