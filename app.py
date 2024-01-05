import threading

import cv2
import av
import streamlit as st
from streamlit_webrtc import webrtc_streamer


# Initialize
lock = threading.Lock()

if not 'images' in st.session_state:
    st.session_state['images'] = []

if not 'active' in st.session_state:
    st.session_state['active'] = False

if not 'image' in st.session_state:
    st.session_state['image'] = None

data = {
    'img': None,
}

# Callbacks

# sharpness = st.slider('Sharpness', min_value=1, max_value=20, value=10, step=1)
sharpness = 1000
brightness = st.slider('Brightness', min_value=-100, max_value=100, value=0, step=5)

def video_frame_callback(frame):
    img = frame.to_ndarray(format='rgb24')
    img = img * (sharpness/10) + brightness
    img = np.clip(img, 0, 255)
    with lock:
        data['img'] = img
    return av.VideoFrame.from_ndarray(img, format='rgb24')

def add_image():
    with lock:
        # img = data['img']
        img = st.session_state['image']
        if img is None:
            return
        st.session_state['images'].append(img)

# Components
st.title('Robiemon prototype')
ctx = webrtc_streamer(
    key='cam',
    video_frame_callback=video_frame_callback,
    media_stream_constraints={
        'video': True,
        'audio': False,
    },
)


st.write(f'v: {ctx.state.playing} {ctx.state.signalling}')
st.write(data, brightness, st.session_state['image'])

st.button('Add', on_click=add_image, disabled=not ctx.state.playing)
for i in st.session_state['images']:
    st.image(i)

# while ctx.state.playing:
#     pass
