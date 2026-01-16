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
    const zoom = document.getElementById('zoom');
    if (zoom) {
        zoom.addEventListener('click', toggleZoom);
    }
});
