import { fabric } from 'fabric';
import { ISeat } from './interfaces/seats';

export class SeatCanvas {
    canvas: fabric.Canvas
    grid = 30
    backgroundColor = '#f8f8f8'
    lineStroke = '#ebebeb'
    tableFill = 'rgba(150, 111, 51, 0.7)'
    tableStroke = '#694d23'
    tableShadow = 'rgba(0, 0, 0, 0.4) 3px 3px 7px'
    chairFill = 'rgba(67, 42, 4, 0.7)'
    chairActiveFill = 'rgba(52, 152, 219,.7)'
    chairOccupiedFill = 'rgba(46, 204, 113,.7)'
    chairStroke = '#32230b'
    chairShadow = 'rgba(0, 0, 0, 0.4) 3px 3px 7px'
    barFill = 'rgba(0, 93, 127, 0.7)'
    barStroke = '#003e54'
    barShadow = 'rgba(0, 0, 0, 0.4) 3px 3px 7px'
    barText = 'Bar'
    wallFill = 'rgba(136, 136, 136, 0.7)'
    wallStroke = '#686868'
    wallShadow = 'rgba(0, 0, 0, 0.4) 5px 5px 20px'

    constructor(id: string) {
        this.canvas = new fabric.Canvas(id);
        this.initCanvas();
    }

    initCanvas() {
        this.canvas.backgroundColor = this.backgroundColor
        
        for (let i = 0; i < (this.canvas.height! / this.grid); i++) {
            const lineX = new fabric.Line([ 0, i * this.grid, this.canvas.height!, i * this.grid], {
                stroke: this.lineStroke,
                selectable: false,
                type: 'line'
            })
            const lineY = new fabric.Line([ i * this.grid, 0, i * this.grid, this.canvas.height!], {
                stroke: this.lineStroke,
                selectable: false,
                type: 'line'
            })
            this.sendLinesToBack()
            this.canvas.add(lineX)
            this.canvas.add(lineY)
        }
        
        this.canvas.on('object:moving', (e: fabric.IEvent | any) => {
            this.snapToGrid(e.target);
        })
        
        this.canvas.on('object:scaling', function(e: fabric.IEvent | any) {
            if (e.target!.scaleX! > 5) {
                e.target!.scaleX = 5
            }
            if (e.target!.scaleY! > 5) {
                e.target!.scaleY = 5
            }
            if (!e.target!.strokeWidthUnscaled && e.target.strokeWidth) {
                e.target.strokeWidthUnscaled = e.target.strokeWidth
            }
            if (e.target.strokeWidthUnscaled) {
                e.target.strokeWidth = e.target.strokeWidthUnscaled / e.target.scaleX
                if (e.target.strokeWidth === e.target.strokeWidthUnscaled) {
                    e.target.strokeWidth = e.target.strokeWidthUnscaled / e.target.scaleY
                }
            }
        })
        
        this.canvas.on('object:modified', (e: fabric.IEvent | any) => {
            e.target!.scaleX = e.target!.scaleX! >= 0.25 ? (Math.round(e.target!.scaleX! * 2) / 2) : 0.5
            e.target!.scaleY = e.target!.scaleY! >= 0.25 ? (Math.round(e.target!.scaleY! * 2) / 2) : 0.5
            this.snapToGrid(e.target)
            if (e.target!.type === 'table') {
                this.canvas.bringToFront(e.target!)
            }
            else {
                this.canvas.sendToBack(e.target!)
            }
            this.sendLinesToBack()
            if (!e.target.data) {
                const objects = e.target.getObjects();
                for (let i=0; i < objects.length; i++) {
                    const object = objects[i];
                    if (object.data.id) {
                        object.set('data', { ...object.data, updated: true });
                    }
                }
            } else {
                const object = e.target;
                if (object.data.id) {
                    object.set('data', { ...object.data, updated: true });
                }
            }
        })
        
        this.canvas.on('object:moving', (e: fabric.IEvent | any) => {
            this.checkBoudningBox(e)
        })
        this.canvas.on('object:rotating', (e: fabric.IEvent | any) => {
            this.checkBoudningBox(e)
        })
        this.canvas.on('object:scaling', (e: fabric.IEvent | any) => {
            this.checkBoudningBox(e)
        })
    }

    checkBoudningBox(e: fabric.IEvent) {
        const obj = e.target
      
        if (!obj) {
          return
        }
        obj.setCoords()
      
        const objBoundingBox = obj.getBoundingRect()
        if (objBoundingBox.top < 0) {
          obj.set('top', 0)
          obj.setCoords()
        }
        if (objBoundingBox.left > this.canvas.width! - objBoundingBox.width) {
          obj.set('left', this.canvas.width! - objBoundingBox.width)
          obj.setCoords()
        }
        if (objBoundingBox.top > this.canvas.height! - objBoundingBox.height) {
          obj.set('top', this.canvas.height! - objBoundingBox.height)
          obj.setCoords()
        }
        if (objBoundingBox.left < 0) {
          obj.set('left', 0)
          obj.setCoords()
        }
    }

    snapToGrid(target: fabric.IEvent | any) {
        target
        target.set({
            left: Math.round(target.left / (this.grid / 2)) * this.grid / 2,
            top: Math.round(target.top / (this.grid / 2)) * this.grid / 2
        })
    }

    sendLinesToBack() {
        this.canvas.getObjects().map((o: fabric.Object) => {
            if (o.type === 'line') {
                this.canvas.sendToBack(o)
            }
        })
    }

    addChair({ angle, top, left, width = this.grid, height = this.grid, scale_x = 1, scale_y = 1, data }: Omit<ISeat, "number">, focus: boolean = true, occupied: boolean = false) {
        const r = new fabric.Rect({
            width, height,
            fill: occupied ? this.chairOccupiedFill : this.chairFill,
            stroke: this.chairStroke,
            strokeWidth: 2,
            shadow: this.chairShadow,
            originX: 'center',
            originY: 'center',
            centeredRotation: true,
            snapAngle: 45,
            type: 'rect'
        });
        const t = new fabric.IText(data.number, {
            fontFamily: 'Calibri',
            fontSize: 14,
            fill: '#fff',
            textAlign: 'center',
            originX: 'center',
            originY: 'center',
            type: 'text'
        });
        const o = new fabric.Group([r, t], {
            data, angle, left, top, width, height,
            scaleX: scale_x, scaleY: scale_y,
            centeredRotation: true,
            snapAngle: 45,
            selectable: true,
            type: 'chair'
        });

        this.canvas.add(o);
        if (focus) this.canvas.setActiveObject(o);
        return o
    }

    removeChair(target: fabric.Object) {
        this.canvas.remove(target);
    }

    getChair(seatNumber: number): fabric.Group {
        // @ts-ignore
        return this.canvas.getObjects("chair").find(s=> s.data.number === seatNumber);
    }

    setUnselectable() {
        this.canvas.getObjects().map(o => {
            o.hasControls = false
            o.lockMovementX = true
            o.lockMovementY = true
            if (o.type === 'chair') {
                o.selectable = false
            }
        })
        this.canvas.selection = false
        this.canvas.hoverCursor = 'pointer'
        this.canvas.discardActiveObject()
        this.canvas.renderAll()
    }
}