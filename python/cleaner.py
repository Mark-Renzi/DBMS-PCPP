import pandas as pd
import json
import os
import sys
import re
import numpy as np
import uuid

# create an empty dataframe to hold generic part info,
# aggregated from all tables
part = pd.DataFrame(columns=['id', 'price', 'manufacturer', 'model'])

cpu = pd.read_json('data/pcpartpicker/cpu.json')
cpu['id'] = [uuid.uuid4() for _ in range(len(cpu.index))]
print(cpu.head())

gpu = pd.read_json('data/pcpartpicker/video-card.json')
gpu['id'] = [uuid.uuid4() for _ in range(len(gpu.index))]
print(gpu.head())