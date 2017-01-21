import HTML5Backend, { NativeTypes } from 'react-dnd-html5-backend'
import { DragDropContext, DragLayer, DropTarget } from 'react-dnd'

// Usage:
//
// @DragAndDrop()
// class Application extends Component {
// 	render() {
// 		const { isDragging, children } = this.props
// 		return <div>{ children }</div>
// 	}
// }
//
// @CanDrop(File, (props, dropped) => alert('Uploading file'))
// class FileDropArea extends Component {
// 	render() {
// 		return <div>Drop files here</div>
// 	}
// }

// Decorate the droppable area component with this decorator
export function CanDrop(type, drop)
{
	return DropTarget(get_react_dnd_type(type),
	{
		drop: (props, monitor) => drop(props, get_dropped_object(monitor, type)),

		// canDrop(props, monitor)
		// {
		// 	switch (type)
		// 	{
		// 		// // Browser doesn't allow reading "files" until the drop event.
		// 		// case File:
		// 		// 	return monitor.getItem().files.length === 1
		// 		default:
		// 			return true
		// 	}
		// }
	},
	(connect, monitor) =>
	({
		dropTarget  : connect.dropTarget(),
		draggedOver : monitor.isOver(),
		canDrop     : monitor.canDrop()
	}))
}

// Decorate the root React application component with this decorator
export function DragAndDrop()
{
	const context = DragDropContext(HTML5Backend)

	const layer = DragLayer((monitor) =>
	({
		isDragging : monitor.isDragging(),
		// item           : monitor.getItem(),
		// item_type      : monitor.getItemType(),
		// current_offset : monitor.getSourceClientOffset()
	}))

	return component => context(layer(component))
}

// Native file drag'n'drop (single file)
export const File = 'File'
export const FILE = File

// Native file drag'n'drop (multiple files)
export const Files = 'Files'
export const FILES = Files

// Gets the corresponding `react-dnd` type
// for a given droppable object type
function get_react_dnd_type(type)
{
	switch (type)
	{
		case File:
		case Files:
			return NativeTypes.FILE
		default:
			return type
	}
}

// Gets the dropped object from `monitor`
function get_dropped_object(monitor, type)
{
	const dropped = monitor.getItem()

	switch (type)
	{
		case File:
			return dropped.files[0]
		case Files:
			return dropped.files
		default:
			return dropped
	}
}