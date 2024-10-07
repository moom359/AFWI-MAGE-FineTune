import subprocess
from setuptools import setup, find_packages

def download_spacy_model():
    subprocess.call(['python', '-m', 'spacy', 'download', 'en_core_web_sm'])

setup(
    name='MAGE-Finetune',
    version='0.1',
    packages=find_packages(),
    install_requires=[
        # List your requirements here
    ],
    entry_points={
        'console_scripts': [
            'download-spacy-model=setup:download_spacy_model',
        ],
    },
)