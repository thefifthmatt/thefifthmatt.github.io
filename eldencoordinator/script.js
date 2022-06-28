class MapInput extends React.Component {
    constructor(props) {
        super(props);
        this.descs = Object.fromEntries(Object.keys(maps).map(id => [id, getMapDesc(id)]));
        this.revDescs = Object.fromEntries(Object.entries(this.descs).map(([k, v]) => [v, k]));
        this.state = {value: ''};
    }

    handleKeyDown = (e) => {
        if (e.key == 'Enter') {
            this.addMap(this.state.value);
        }
    }

    handleChange = (e) => {
        this.setState({value: e.target.value});
    }

    handleAdd = (e) => {
        this.addMap(this.state.value);
    }

    handleClear = (e) => {
        this.setState({value: ''});
    }

    addMap(desc) {
        const id = desc.split(' ')[0];
        if (id in this.descs) {
            this.props.onAdd(id);
            this.setState({value: ''});
        }
    }

    render() {
        const autoItems = Object.entries(this.descs).map(([id, desc]) =>
            <option key={id} value={desc} />
        );
        return (
            <div>
                <label htmlFor="select">Type a map id or name: </label>
                <input list="maplist" id="select" name="select" value={this.state.value} onKeyDown={this.handleKeyDown} onChange={this.handleChange} />
                <datalist id="maplist">
                    {autoItems}
                </datalist>
                &nbsp;<button className="actionbutton" onClick={this.handleAdd}>Add map</button> | <button className="actionbutton" onClick={this.handleClear}>Clear textbox</button>
            </div>
        );
    }
}

class Coordinator extends React.Component {
    constructor(props) {
        super(props);
        this.state = {maps: []};
    }

    componentDidMount() {
        // this.handleAdd('m10_00_00_00');
    }

    updateMap(map, root) {
        // Do root stuff first
        if (root == null || map.id == root.id) {
            map.isRoot = true;
            map.transform = ORIGIN;
        } else {
            map.isRoot = false;
            map.transform = calcOffset(map.id, root.id);
        }
        // Fill in various metadata
        if (!map.desc) {
            map.desc = getMapDesc(map.id);
        }
        if (!map.relatives) {
            map.relatives = [];
            function addRelative(title, rel) {
                if (!(rel in maps)) return false;
                map.relatives.push({id: rel, title: title});
                return true;
            }
            const mapId = parseMap(map.id);
            const scale = mapId[3] % 10;
            // Parents
            if (mapId[0] == 60 && scale < 2) {
                let tileX = mapId[1];
                let tileZ = mapId[2];
                tileX = Math.floor(tileX / 2);
                tileZ = Math.floor(tileZ / 2);
                let parent = formatMap([60, tileX, tileZ, scale + 1]);
                if (addRelative('Parent', parent) && scale == 0) {
                    tileX = Math.floor(tileX / 2);
                    tileZ = Math.floor(tileZ / 2);
                    parent = formatMap([60, tileX, tileZ, scale + 2]);
                    addRelative('Grandparent', parent);
                }
            }
            // Children
            if (mapId[0] == 60 && scale > 0) {
                const order = ["Southwest", "Northwest", "Southeast", "Northeast"];
                let orderIndex = 0;
                let tileX = mapId[1];
                let tileZ = mapId[2];
                for (let col = 0; col <= 1; col++)
                {
                    for (let row = 0; row <= 1; row++)
                    {
                        const child = formatMap([60, tileX * 2 + col, tileZ * 2 + row, scale - 1]);
                        addRelative(order[orderIndex], child);
                        orderIndex++;
                    }
                }
            }
            // Connections
            if (map.id in connects) {
                connects[map.id].forEach(con => {
                    addRelative('Connection', con);
                });
            }
        }
    }

    handleAdd = (id) => {
        if (this.state.maps.some(m => m.id == id)) return;
        const map = {
            id: id,
        };
        const root = this.state.maps.find(m => m.isRoot);
        this.updateMap(map, root);
        this.setState({maps: [...this.state.maps, map]});
    }

    handleRemove(id) {
        const mapIndex = this.state.maps.findIndex(m => m.id == id);
        if (mapIndex == -1) return;
        const newMaps = this.state.maps.filter((_, i) => i != mapIndex);
        const root = newMaps.find(m => m.isRoot);
        if (newMaps.length > 0 && root == null) {
            // Make first one root, I suppose
            this.reroot(newMaps, newMaps[0]);
        }
        this.setState({maps: newMaps});
    }

    handleOrigin(id) {
        const map = this.state.maps.find(m => m.id == id);
        if (!map) return;
        this.reroot(this.state.maps, map);
        this.setState({maps: Array.from(this.state.maps)});
    }

    reroot(maps, newRoot) {
        maps.forEach(m => this.updateMap(m, newRoot));
    }

    render() {
        let dataTable = null;
        const maps = this.state.maps;
        const ff = (f) => f.toFixed(3);
        if (maps.length > 0) {
            const rows = maps.map(map => {
                let rels = null;
                if (map.relatives.length > 0) {
                    rels = (
                        <ul>
                            {map.relatives.map(r => (
                                <li key={r.id}>
                                    {r.title}: <button className="actionbutton" onClick={() => this.handleAdd(r.id)}>{r.id}</button> {getMapDescOnly(r.id)}
                                </li>
                            ))}
                        </ul>
                    );
                }
                // Array.from(map.transform).map(f => <code>{ff(f)}</code>)
                return (
                    <tr key={map.id}>
                        <td className="oneline">
                            <button className="actionbutton" onClick={() => this.handleRemove(map.id)}>Remove</button> | <button className="actionbutton" onClick={() => this.handleOrigin(map.id)}>Set as origin</button>
                        </td>
                        <td className="oneline">
                            {map.transform &&
                                <span>
                                <code>{ff(map.transform[0])}</code> <code>{ff(map.transform[1])}</code> <code>{ff(map.transform[2])}</code>
                                </span>
                            }
                        </td>
                        <td>
                            <strong>{map.desc}</strong>
                            {rels}
                        </td>
                    </tr>
                );
            });
            dataTable = (
                <table>
                    <tbody>
                        {rows}
                    </tbody>
                </table>
            );
        }
        return (
            <div>
                <MapInput onAdd={this.handleAdd} />
                {dataTable}
            </div>
        );
    }
}

function getMapDesc(id) {
    if (id in maps && maps[id] != null) {
        return `${id} ${maps[id]}`;
    }
    return id;
}

function getMapDescOnly(id) {
    if (id in maps && maps[id] != null) {
        return maps[id];
    }
    return '';
}

function parseMap(id) {
    if (id.startsWith('m')) id = id.substring(1);
    return id.split('_').map(d => parseInt(d, 10));
}

function formatMap(mapId) {
    return 'm' + mapId.map(m => String(m).padStart(2, '0')).join('_');
}

const ORIGIN = Float64Array.from([0, 0, 0]);

function sum(a, b) {
    return Float64Array.from([a[0] + b[0], a[1] + b[1], a[2] + b[2]]);
}
function neg(a) {
    return Float64Array.from([-a[0], -a[1], -a[2]]);
}

function calcOffset(mapId, originMapId) {
    // The global coord step is a possible loss of precision, but it's good enough.
    const mapCoord = toGlobalCoords(mapId, ORIGIN);
    const originCoord = toGlobalCoords(originMapId, ORIGIN);
    return sum(mapCoord, neg(originCoord));
}

function toGlobalCoords(mapIdStr, local) {
    let tileX, tileZ;
    let offset = ORIGIN;
    const mapId = parseMap(mapIdStr);
    if (mapId[0] == 60) {
        const scale = mapId[3] % 10;
        let scaleFactor = 1;
        if (scale == 1) {
            scaleFactor = 2;
            offset = Float64Array.from([128, 0, 128]);
        } else if (scale == 2) {
            scaleFactor = 4;
            offset = Float64Array.from([384, 0, 384]);
        }
        tileX = mapId[1] * scaleFactor;
        tileZ = mapId[2] * scaleFactor;
    } else {
        if (!(mapIdStr in offsets)) throw new Error(`Unknown map ${mapIdStr}`);
        ({tileX, tileZ, offset} = offsets[mapIdStr]);
    }
    // Offset for tile based on arbitrary origin at the center of a hypothetical m60_16_16_00, plus local coords
    const tileOrigin = Float64Array.from([(tileX - 16) * 256, 0, (tileZ - 16) * 256]);
    return sum(sum(local, offset), tileOrigin);
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<Coordinator />);