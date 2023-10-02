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
splitname = cpu['name'].str.split(' ', 1)
cpu['manufacturer'] = splitname.str[0]
cpu['model'] = splitname.str[1]

part = part.append(cpu[['id', 'price', 'manufacturer', 'model']])

gpu = pd.read_json('data/pcpartpicker/video-card.json')
gpu['id'] = [uuid.uuid4() for _ in range(len(gpu.index))]
splitname = gpu['name'].str.split(' ', 1)
gpu['manufacturer'] = splitname.str[0]
gpu['model'] = splitname.str[1]

part = part.append(gpu[['id', 'price', 'manufacturer', 'model']])

motherboard = pd.read_json('data/pcpartpicker/motherboard.json')
motherboard['id'] = [uuid.uuid4() for _ in range(len(motherboard.index))]
splitname = motherboard['name'].str.split(' ', 1)
motherboard['manufacturer'] = splitname.str[0]
motherboard['model'] = splitname.str[1]

part = part.append(motherboard[['id', 'price', 'manufacturer', 'model']])

memory = pd.read_json('data/pcpartpicker/memory.json')
memory['id'] = [uuid.uuid4() for _ in range(len(memory.index))]
splitname = memory['name'].str.split(' ', 1)
memory['manufacturer'] = splitname.str[0]
memory['model'] = splitname.str[1]
memory = memory.assign(DDR=memory['speed'].str[0])
memory = memory.assign(MHz=memory['speed'].str[1])
memory['DDR'] = memory['DDR'].astype(int)
memory['MHz'] = memory['MHz'].astype(int)
memory = memory.assign(Count=memory['modules'].str[0])
memory = memory.assign(Size=memory['modules'].str[1])

print(memory)

# print(part)

# part = part.dropna(subset=['price'])

# print(part)