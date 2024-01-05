import streamlit as st
from streamlit_webrtc import webrtc_streamer
import cv2
import av #strealing video library

st.title('Streamlit App Test')
st.write('Gray Scale -> Color')


#Class
class VideoProcessor:

    def __init__(self) -> None:
        self.brightness = None

    def recv(self, frame):
        img = frame.to_ndarray(format = 'bgr24')

        img = img + brightness
        img[:100, :100, :] = 0

        return av.VideoFrame.from_ndarray(img, format='bgr24')

ctx = webrtc_streamer(
    key='example',
    video_processor_factory=VideoProcessor,
    media_stream_constraints={
        'video': True,
        'audio': False,
    },
)

if ctx.video_processor:
    ctx.video_processor.brightness = st.slider('Brightness', min_value=-100, max_value=100, value=0, step=5)
