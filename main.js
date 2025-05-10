const TABLE_WIDTH = 9
const TABLE_HEIGHT = 9
const TABLE_SIZE = TABLE_WIDTH * TABLE_HEIGHT
const MINE_COUNT = 10
const FIELDS_COUNT = TABLE_SIZE - MINE_COUNT
// elements
const winner_element = document.getElementById('winner')
const gameover_element = document.getElementById('gameover')
const table = document.getElementsByTagName('table')[0]
const cells = Array
	.from(Array(TABLE_HEIGHT), (_, y) => {
		const tr = document.createElement('tr')
		table.tBodies[0].appendChild(tr)
		return Array.from(Array(TABLE_WIDTH), (_, x) => {
			const cell_index = y * TABLE_HEIGHT + x
			const td = document.createElement('td')
			tr.appendChild(td)
			td.setAttribute('data-index', cell_index)
			td.addEventListener('contextmenu', cell_oncontextmenu)
			td.addEventListener('mousedown', cell_onmousedown)
			return td
		})
	})
	.flatMap(o => o)
// game_state
let pause = false
let verified_fields_count = 0

/**
 * @param {MouseEvent} event 
 */
function cell_oncontextmenu(event) {
	event.preventDefault()
}
/**
 * @param {MouseEvent} event 
 */
function cell_onmousedown(event) {
	if (pause)
		return
	/** @type {HTMLTableCellElement} */
	const cell = event.target
	switch (event.button) {
		case 0: // Left-Click
			cell_explode(cell)
			// winning_verify
			if(verified_fields_count === FIELDS_COUNT) {
				pause = true
				winner_element.hidden = false
			}
			break
		case 2: // Right-Click
			if (cell.dataset['exploded'] === undefined) {
				if (cell.dataset['flagged'] !== undefined) {
					cell.removeAttribute('data-flagged')
				} else {
					cell.dataset['flagged'] = ''
				}
			}
			break;
	}
}
function game_over() {
	pause = true
	gameover_element.hidden = false
}
/**
 * 
 * @param {HTMLTableCellElement} cell
 * @returns {HTMLTableCellElement[]}
 */
function cell_nearby(cell) {
	const index = parseInt(cell.dataset['index'])
	const is_border_left = cell.cellIndex === 0
	const is_border_right = cell.cellIndex === (TABLE_WIDTH - 1)
	const is_border_top = index < TABLE_WIDTH
	const is_border_bottom = index > (TABLE_SIZE - TABLE_WIDTH)

	const top_left = is_border_left || is_border_top
		? undefined
		: cells[index - TABLE_WIDTH - 1]
	const top = is_border_top
		? undefined
		: cells[index - TABLE_WIDTH]
	const top_right = is_border_top || is_border_right
		? undefined
		: cells[index - TABLE_WIDTH + 1]
	const left = is_border_left
		? undefined
		: cells[index - 1]
	const right = is_border_right
		? undefined
		: cells[index + 1]
	const bottom_left = is_border_left || is_border_bottom
		? undefined
		: cells[index + TABLE_WIDTH - 1]
	const bottom = is_border_bottom
		? undefined
		: cells[index + TABLE_WIDTH]
	const bottom_right = is_border_bottom || is_border_right
		? undefined
		: cells[index + TABLE_WIDTH + 1]

	return [
		top_left, top, top_right,
		left, right,
		bottom_left, bottom, bottom_right
	].filter(o => o)
}
function cell_explode(cell) {
	if (cell.dataset['exploded'] !== undefined)
		return
	const is_mined = cell.dataset['mined'] !== undefined
	cell.dataset['exploded'] = ''
	verified_fields_count++
	cell.removeAttribute('data-flagged')
	if (is_mined) {
		return game_over()
	}
	if (cell.dataset['count']) {
		cell.innerText = cell.dataset['count']
	} else {
		cell_nearby(cell).map(cell_explode)
	}
}
function main() {
	// game_reset
	verified_fields_count = 0
	pause = false
	gameover_element.hidden = true
	winner_element.hidden = true
	for (const cell of cells) {
		cell.removeAttribute('data-mined')
		cell.removeAttribute('data-count')
		cell.removeAttribute('data-exploded')
		cell.removeAttribute('data-flagged')
		cell.innerText = ''
	}
	// mine_generate
	for (let i = 0; i < MINE_COUNT; i++) {
		const index = Math.floor(Math.random() * TABLE_SIZE)
		const cell = cells[index]
		cell.removeAttribute('data-count')
		cell.dataset['mined'] = ''
		cell_nearby(cell).map(cell => {
			const is_mined = cell.dataset['mined'] === 'true'
			if (!is_mined) {
				const count = parseInt(cell.dataset['count']) || 0
				cell.dataset['count'] = count + 1
			}
		})
	}
}

main()