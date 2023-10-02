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
cpu = cpu.dropna(subset=['price'])

print(cpu)

part = part.append(cpu[['id', 'price', 'manufacturer', 'model']])

gpu = pd.read_json('data/pcpartpicker/video-card.json')
gpu['id'] = [uuid.uuid4() for _ in range(len(gpu.index))]
splitname = gpu['name'].str.split(' ', 1)
gpu['manufacturer'] = splitname.str[0]
gpu['model'] = splitname.str[1]
gpu = gpu.dropna(subset=['price'])

print(gpu)

part = part.append(gpu[['id', 'price', 'manufacturer', 'model']])

motherboard = pd.read_json('data/pcpartpicker/motherboard.json')
motherboard['id'] = [uuid.uuid4() for _ in range(len(motherboard.index))]
splitname = motherboard['name'].str.split(' ', 1)
motherboard['manufacturer'] = splitname.str[0]
motherboard['model'] = splitname.str[1]
motherboard = motherboard.dropna(subset=['price'])

print(motherboard)

part = part.append(motherboard[['id', 'price', 'manufacturer', 'model']])

memory = pd.read_json('data/pcpartpicker/memory.json')
memory['id'] = [uuid.uuid4() for _ in range(len(memory.index))]
splitname = memory['name'].str.split(' ', 1)
memory['manufacturer'] = splitname.str[0]
memory['model'] = splitname.str[1]
memory = memory.assign(DDR=memory['speed'].str[0])
memory = memory.assign(MHz=memory['speed'].str[1])
memory = memory.dropna(subset=['DDR'])
memory = memory.dropna(subset=['MHz'])
memory['DDR'] = memory['DDR'].astype(int)
memory['MHz'] = memory['MHz'].astype(int)
memory = memory.assign(Count=memory['modules'].str[0])
memory = memory.assign(Size=memory['modules'].str[1])
memory['Capacity'] = memory['Count'] * memory['Size']
memory = memory.dropna(subset=['price'])

print(memory)

part = part.append(memory[['id', 'price', 'manufacturer', 'model']])

storage = pd.read_json('data/pcpartpicker/internal-hard-drive.json')
storage['id'] = [uuid.uuid4() for _ in range(len(storage.index))]
splitname = storage['name'].str.split(' ', 1)
storage['manufacturer'] = splitname.str[0]
storage['model'] = splitname.str[1]
storage = storage.dropna(subset=['price'])

print(storage)

part = part.append(storage[['id', 'price', 'manufacturer', 'model']])

psu = pd.read_json('data/pcpartpicker/power-supply.json')
psu['id'] = [uuid.uuid4() for _ in range(len(psu.index))]
splitname = psu['name'].str.split(' ', 1)
psu['manufacturer'] = splitname.str[0]
psu['model'] = splitname.str[1]
psu = psu.dropna(subset=['price'])

print(psu)

part = part.append(psu[['id', 'price', 'manufacturer', 'model']])

case = pd.read_json('data/pcpartpicker/case.json')
case['id'] = [uuid.uuid4() for _ in range(len(case.index))]
splitname = case['name'].str.split(' ', 1)
case['manufacturer'] = splitname.str[0]
case['model'] = splitname.str[1]
case = case.dropna(subset=['price'])

print(case)

part = part.append(case[['id', 'price', 'manufacturer', 'model']])

cpucooler = pd.read_json('data/pcpartpicker/cpu-cooler.json')
cpucooler['id'] = [uuid.uuid4() for _ in range(len(cpucooler.index))]
splitname = cpucooler['name'].str.split(' ', 1)
cpucooler['manufacturer'] = splitname.str[0]
cpucooler['model'] = splitname.str[1]
cpucooler = cpucooler.dropna(subset=['price'])

cpucooler['RPM_Min'] = cpucooler['rpm'].apply(lambda x: x[0] if isinstance(x, list) else x)
cpucooler['RPM_Max'] = cpucooler['rpm'].apply(lambda x: x[1] if isinstance(x, list) else x)

cpucooler['NoiseLevel_Min'] = cpucooler['noise_level'].apply(lambda x: x[0] if isinstance(x, list) else x)
cpucooler['NoiseLevel_Max'] = cpucooler['noise_level'].apply(lambda x: x[1] if isinstance(x, list) else x)

print(cpucooler)

part = part.append(cpucooler[['id', 'price', 'manufacturer', 'model']])

print(part)

# part = part.dropna(subset=['price'])

# print(part)