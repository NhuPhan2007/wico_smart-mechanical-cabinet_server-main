let width = 5;
let height = 3;
let noFloor = 2;
let item = [
    "item1",
    "item2",
    "item3",
    "item4",
    "item5",
    "item6",
    "item7",
    "item8",
    "item9",
    "item10",
    "item11",
    "item12",
    "item13",
    "item14",
    "item15",
]
//matrix will be used to store the data of the floor width x height x noFloor
//each element of the matrix is an object with the following properties:
// - uid: the uid of the card
//  -id: the id of the rfid reader
// - time: the time when the card is last detected
//the matrix is initialized with the default value of -1 for id and 0 for time

/**
 * Creates a matrix with the specified dimensions and initializes each element with default values.
 * @param {number} floor - The number of floors in the matrix.
 * @param {number} width - The width of each floor in the matrix.
 * @param {number} height - The height of each floor in the matrix.
 * @returns {Array} - The created matrix.
 */
function createMatrix(floor, width, height) {
    let count = 0;
    let matrix = new Array(noFloor);
    for (let i = 0; i < noFloor; i++) {
        matrix[i] = new Array(height);
        for (let j = 0; j < height; j++) {
            matrix[i][j] = new Array(width);
            for (let k = 0; k < width; k++) {
                matrix[i][j][k] = {
                    uid: null,
                    id: count, // the location of the rfid reader ( 1-15 for floor 1 and 16-30 for floor 2)
                    time: Date.now(),
                    item: item[count], //normally, this mean notthing is store here.
                    isThingThere: false,
                }
                setNewLocation(count, k, j, i);
                count++
            }
        }
    }
    return matrix
}

//list of item that will be used to store the item that is detected by the rfid reader
let locationList = new Map();
//the item will be stored in the following format:
// - key: the id of rfid
// - value: the location of the item in the matrix (x, y, floor)

// list of item that will be used to store the item that is detected by the rfid reader
let listItem = [
    { item: "Wire_Stripper", uids: [2211766823, 3286080041] },
    { item: "Ratchet_Pipe_Cutter", uids: [334518312, 595553832] },
    { item: "Adjustable_Wrench", uids: [1667640618, 318977578] },
    { item: "Locking_Piler", uids: [597055529, 331145511, 1394173736] },
    { item: "Electronic_Cutters", uids: [2740209960, 1131940394] },
    { item: "Double_Headed_Screwdriver", uids: [3550035498, 56938023] },
    { item: "Interchangeable_Screwdriver", uids: [53951273, 3271973417] },
]

/**
 * Sets a new location for an item identified by its ID.
 * @param {string} id - The ID of the item.
 * @param {number} x - The x-coordinate of the new location.
 * @param {number} y - The y-coordinate of the new location.
 * @param {number} floor - The floor level of the new location.
 * @returns {boolean} - Returns true if the item's location was successfully set, false otherwise.
 */
function setNewLocation(id, x, y, floor) {
    if (!locationList.has(id)) {
        locationList.set(id, { x: x, y: y, floor: floor });
        return true;
    }
    return false;
}

/**
 * Retrieves the location of an RFID item based on its ID.
 * @param {string} id - The ID of the location of RFID item in the field.
 * @returns {object|null} - The location of the RFID item, or null if the item does not exist.
 */
function getLocationOfRFID(id) {
    if (!locationList.has(id)) {
        return null;
    }
    return locationList.get(id);
}

/**
 * Updates the UID of an item based on its ID. if the uid is 0, it means the item is removed.
 * @param {string} id - The ID of the item.
 * @param {number} uid - The new UID of the item.
 * @param {Array} matrix - The matrix containing the item data.
 * @returns {string} - A message indicating the success or failure of the update.
 */
function updateUID(id, uid, matrix) {
    let location = getLocationOfRFID(id);
    if (location != null) {
        let itemName;
        if (uid == 0) { //if the uid is 0, it means the item is removed
            matrix[location.floor][location.y][location.x].uid = uid;
            matrix[location.floor][location.y][location.x].item = `item${id}`;
            matrix[location.floor][location.y][location.x].time = Date.now();
            return "update for id: " + id + " success. item: " + itemNam + " uid: " + uid + " location: " + location.x + ", " + location.y + ", " + location.floor;
        } else {
            itemName = getItemName(uid);
            if (itemName == null) return "Item not found. uid not registered.";
            matrix[location.floor][location.y][location.x].uid = uid;
            matrix[location.floor][location.y][location.x].item = itemName;
            matrix[location.floor][location.y][location.x].time = Date.now();
            return "update for id: " + id + " success. item: " + itemName + " uid: " + uid + " location: " + location.x + ", " + location.y + ", " + location.floor;
        }
    }
    return "id not found.";
}

/**
 * Retrieves the name of an item based on its UID.
 * @param {number} uid - The UID of the item.
 * @returns {string|null} - The name of the item, or null if the item does not exist.
 */
function getItemName(uid) {
    for (let i = 0; i < listItem.length; i++) {
        if (listItem[i].uids.includes(+uid)) {
            return listItem[i].item;
        }
    }
    return null;

}

/**
 * Checks the presence of an item in the matrix.
 * @param {string} itemName - The name of the item to check.
 * @param {Array} matrix - The matrix containing the item data.
 * @returns {boolean} - Returns true if the item is present in the matrix, false otherwise.
 */
function checkItem(itemName, matrix) {
    let count = 0;
    for (let i = 0; i < noFloor; i++) {
        for (let j = 0; j < height; j++) {
            for (let k = 0; k < width; k++) {
                if (matrix[i][j][k].item == itemName) {
                    count++;
                }
            }
        }
    }
    return count == listItem.find(item => item.item == itemName).uids.length
}

/**
 * Updates the location of an item based on its ID.
 * @param {Array} isThingTheres - The array containing the presence of items.
 * @param {Array} matrix - The matrix containing the item data.
 * @returns {boolean} - Returns true if the item's location was successfully set, false otherwise.
 */
function updateThing(isThingTheres, matrix) {
    for (let i = 0; i < 15; i++) {
        // for (let i = 0; i < isThingTheres.length; i++) {
        if (i < 5) matrix[0][0][i].isThingThere = isThingTheres[i] == 0 ? true : false;
        else if (i < 10) matrix[0][1][i - 5].isThingThere = isThingTheres[i] == 0 ? true : false;
        else matrix[0][2][i - 10].isThingThere = isThingTheres[i] == 0 ? true : false;
    }
    return true;
}

const matrix = createMatrix(noFloor, width, height);
matrix[0][0][0].item = "Wire_Stripper";
matrix[0][0][0].uids = 2211766823;
matrix[0][0][1].item = "Wire_Stripper";
matrix[0][0][1].uids = 3286080041;
matrix[0][0][2].item = "Ratchet_Pipe_Cutter";
matrix[0][0][2].uids = 334518312;
matrix[0][0][3].item = "Ratchet_Pipe_Cutter";
matrix[0][0][3].uids = 595553832;
matrix[0][0][4].item = "Electronic_Cutters";
matrix[0][0][4].uids = 2740209960;
matrix[0][1][0].item = "Adjustable_Wrench";
matrix[0][1][0].uids = 1667640618;
matrix[0][1][1].item = "Adjustable_Wrench";
matrix[0][1][1].uids = 318977578;
matrix[0][1][2].item = "Double_Headed_Screwdriver";
matrix[0][1][2].uids = 3550035498;
matrix[0][1][3].item = "Double_Headed_Screwdriver";
matrix[0][1][3].uids = 56938023;
matrix[0][1][4].item = "Electronic_Cutters";
matrix[0][1][4].uids = 1131940394;
matrix[0][2][0].item = "Locking_Piler";
matrix[0][2][0].uids = 597055529;
matrix[0][2][1].item = "Locking_Piler";
matrix[0][2][1].uids = 331145511;
matrix[0][2][2].item = "Locking_Piler";
matrix[0][2][2].uids = 1394173736;
matrix[0][2][3].item = "Interchangeable_Screwdriver";
matrix[0][2][3].uids = 53951273;
matrix[0][2][4].item = "Interchangeable_Screwdriver";
matrix[0][2][4].uids = 3271973417;


module.exports = {
    matrix: matrix,
    createMatrix: createMatrix,
    setNewLocation: setNewLocation,
    getLocationOfRFID: getLocationOfRFID,
    updateUID: updateUID,
    updateThing: updateThing,
    checkItem: checkItem,
    getItemName: getItemName,
}