import Immutable from 'immutable';
import React from 'react';
import './Drawable.css';

interface DrawAreaProps {}

interface DrawAreaState {
    isDrawing: boolean;
    lines: Immutable.List<any>;
    onMouseUp?: () => void
}

export class Drawable extends React.Component<DrawAreaProps, DrawAreaState> {
    constructor(props: DrawAreaProps) {
        super(props);

        this.state = {
            lines: Immutable.List(),
            isDrawing: false,
        };

        this.handleMouseDown = this.handleMouseDown.bind(this);
        this.handleMouseMove = this.handleMouseMove.bind(this);
        this.handleMouseUp = this.handleMouseUp.bind(this);
    }

    componentDidMount() {
        document.addEventListener('mouseup', this.handleMouseUp);
    }

    componentWillUnmount() {
        document.removeEventListener('mouseup', this.handleMouseUp);
    }

    handleMouseDown(mouseEvent: any) {
        if (mouseEvent.button != 0) {
            return;
        }

        const point = this.relativeCoordinatesForEvent(mouseEvent);

        this.setState((prevState) => ({
            lines: prevState.lines.push(Immutable.List([point])),
            isDrawing: true,
        }));
    }

    handleMouseMove(mouseEvent: any) {
        if (!this.state.isDrawing) {
            return;
        }

        const point = this.relativeCoordinatesForEvent(mouseEvent);

        this.setState((prevState) => ({
            lines: prevState.lines.updateIn([prevState.lines.size - 1], (line: any) => line.push(point)),
        }));
    }

    handleMouseUp() {
        this.setState({ isDrawing: false });
        console.log(this.state.lines);
        
    }

    relativeCoordinatesForEvent(mouseEvent: any) {
        // @ts-ignore
        const boundingRect = this.refs.drawArea.getBoundingClientRect();
        return Immutable.Map({
            x: mouseEvent.clientX - boundingRect.left,
            y: mouseEvent.clientY - boundingRect.top,
        });
    }

    render() {
        return (
            <div
                className="drawArea"
                ref="drawArea"
                onMouseDown={this.handleMouseDown}
                onMouseMove={this.handleMouseMove}
            >
                <Drawing lines={this.state.lines} />
            </div>
        );
    }
}

function Drawing({ lines }: { lines: DrawAreaState['lines'] }) {
    return (
        <svg className="drawing">
            {lines.map((line, index) => (
                <DrawingLine key={index} line={line} />
            ))}
        </svg>
    );
}

function DrawingLine({ line }: { line: any }) {
    const pathData =
        'M ' +
        line
            .map((p: any) => {
                return `${p.get('x')} ${p.get('y')}`;
            })
            .join(' L ');

    return <path className="path" d={pathData} />;
}
