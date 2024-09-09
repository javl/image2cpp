# app.py
from flask import Flask, request, render_template
from flask_cors import CORS
from PIL import Image
import io
import base64
import numpy as np
import requests

app = Flask(__name__)
CORS(app)  # This will enable CORS for all routes

def image_to_byte_array(image, threshold=128, mode='horizontal'):
    width, height = image.size
    pixels = list(image.getdata())
    byte_array = []
    byte = 0
    bit_count = 0

    for y in range(height):
        for x in range(width):
            if mode == 'horizontal':
                pixel = pixels[y * width + x]
            else:  # vertical
                pixel = pixels[x * height + y]

            if isinstance(pixel, tuple):
                pixel = sum(pixel[:3]) // 3  # Convert RGB to grayscale

            if pixel > threshold:
                byte |= (1 << (7 - bit_count))

            bit_count += 1
            if bit_count == 8:
                byte_array.append(byte)
                byte = 0
                bit_count = 0

    # Add any remaining bits
    if bit_count > 0:
        byte_array.append(byte)

    return byte_array

def byte_array_to_image(byte_array, width, height, mode='horizontal'):
    img = Image.new('1', (width, height))
    pixels = img.load()

    byte_index = 0
    bit_index = 0

    for y in range(height):
        for x in range(width):
            if mode == 'horizontal':
                if byte_array[byte_index] & (1 << (7 - bit_index)):
                    pixels[x, y] = 1
                else:
                    pixels[x, y] = 0
            else:  # vertical
                if byte_array[byte_index] & (1 << (7 - bit_index)):
                    pixels[y, x] = 1
                else:
                    pixels[y, x] = 0

            bit_index += 1
            if bit_index == 8:
                byte_index += 1
                bit_index = 0

    return img

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/convert', methods=['POST'])
def convert_image():
    threshold = int(request.form.get('threshold', 128))
    mode = request.form.get('mode', 'horizontal')

    try:
        if 'image' in request.files:
            image_file = request.files['image']
            image = Image.open(image_file).convert('L')
        elif 'image_url' in request.form:
            image_url = request.form['image_url']
            response = requests.get(image_url)
            image = Image.open(io.BytesIO(response.content)).convert('L')
        else:
            return "No image file or URL provided", 400

        byte_array = image_to_byte_array(image, threshold, mode)

        # Format the byte array as a C-style array
        formatted_array = ', '.join(f'0x{byte:02X}' for byte in byte_array)

        # Generate preview image
        preview_image = byte_array_to_image(byte_array, image.width, image.height, mode)
        preview_buffer = io.BytesIO()
        preview_image = preview_image.resize((200, int(200 * image.height / image.width)))  # Resize for preview
        preview_image.save(preview_buffer, format='PNG')
        preview_base64 = base64.b64encode(preview_buffer.getvalue()).decode('utf-8')

        return render_template('result.html',
                               byte_array=formatted_array,
                               width=image.width,
                               height=image.height,
                               preview_image=preview_base64)
    except Exception as e:
        return f"Error: {str(e)}", 500

if __name__ == '__main__':
    app.run(debug=True)
