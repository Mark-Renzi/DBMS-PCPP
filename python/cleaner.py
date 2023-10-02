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

cpu = cpu.rename(columns={'id': 'PartID', 'core_count': 'Cores', 'boost_clock': 'BoostClock', 'core_clock': 'CoreClock', 'graphics': 'Graphics', 'smt': 'SMT', 'tdp': 'TDP'})

gpu = pd.read_json('data/pcpartpicker/video-card.json')
gpu['id'] = [uuid.uuid4() for _ in range(len(gpu.index))]
splitname = gpu['name'].str.split(' ', 1)
gpu['manufacturer'] = splitname.str[0]
gpu['model'] = splitname.str[1]
gpu = gpu.dropna(subset=['price'])

print(gpu)

part = part.append(gpu[['id', 'price', 'manufacturer', 'model']])

gpu = gpu.rename(columns={'id': 'PartID', 'core_clock': 'CoreClock', 'boost_clock': 'BoostClock', 'memory': 'Memory', 'chipset': 'Chipset', 'length': 'Length', 'color': 'Color'})

motherboard = pd.read_json('data/pcpartpicker/motherboard.json')
motherboard['id'] = [uuid.uuid4() for _ in range(len(motherboard.index))]
splitname = motherboard['name'].str.split(' ', 1)
motherboard['manufacturer'] = splitname.str[0]
motherboard['model'] = splitname.str[1]
motherboard = motherboard.dropna(subset=['price'])

print(motherboard)

part = part.append(motherboard[['id', 'price', 'manufacturer', 'model']])

motherboard = motherboard.rename(columns={'id': 'PartID', 'socket': 'Socket', 'form_factor': 'FormFactor', 'max_memory': 'MaxMemory', 'memory_slots': 'MemorySlots', 'color': 'Color'})

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
memory['TotalCapacity'] = memory['Count'] * memory['Size']
memory = memory.dropna(subset=['price'])

print(memory)

part = part.append(memory[['id', 'price', 'manufacturer', 'model']])

memory = memory.rename(columns={'id': 'PartID', 'color': 'Color', 'first_word_latency': 'FirstWord', 'cas_latency': 'CAS', 'price_per_gb': 'PricePerGB', 'TotalCapacity': 'TotalCapacity', 'DDR': 'DDR', 'MHz': 'MHz', 'Count': 'Count', 'Size': 'Capacity'})

storage = pd.read_json('data/pcpartpicker/internal-hard-drive.json')
storage['id'] = [uuid.uuid4() for _ in range(len(storage.index))]
splitname = storage['name'].str.split(' ', 1)
storage['manufacturer'] = splitname.str[0]
storage['model'] = splitname.str[1]
storage = storage.dropna(subset=['price'])

print(storage)

part = part.append(storage[['id', 'price', 'manufacturer', 'model']])

storage = storage.rename(columns={'id': 'PartID', 'price_per_gb': 'PricePerGB', 'capacity': 'Capacity', 'form_factor': 'FormFactor', 'interface': 'Interface', 'cache': 'Cache', 'type': 'Type'})

psu = pd.read_json('data/pcpartpicker/power-supply.json')
psu['id'] = [uuid.uuid4() for _ in range(len(psu.index))]
splitname = psu['name'].str.split(' ', 1)
psu['manufacturer'] = splitname.str[0]
psu['model'] = splitname.str[1]
psu = psu.dropna(subset=['price'])

print(psu)

part = part.append(psu[['id', 'price', 'manufacturer', 'model']])

psu = psu.rename(columns={'id': 'PartID', 'type': 'FormFactor', 'efficiency': 'Efficiency', 'wattage': 'Wattage', 'modular': 'Modular', 'color': 'Color'})

case = pd.read_json('data/pcpartpicker/case.json')
case['id'] = [uuid.uuid4() for _ in range(len(case.index))]
splitname = case['name'].str.split(' ', 1)
case['manufacturer'] = splitname.str[0]
case['model'] = splitname.str[1]
case = case.dropna(subset=['price'])

print(case)

part = part.append(case[['id', 'price', 'manufacturer', 'model']])

case = case.rename(columns={'id': 'PartID', 'type': 'FormFactor', 'internal_35_bays': 'StorageBays', 'color': 'Color', 'side_panel': 'SidePanel', 'external_volume': 'Size', 'psu': 'PSU'})

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

cpucooler = cpucooler.rename(columns={'id': 'PartID', 'size': 'Size', 'color': 'Color', 'RPM_Min': 'RPM_Min', 'RPM_Max': 'RPM_Max', 'NoiseLevel_Min': 'NoiseLevel_Min', 'NoiseLevel_Max': 'NoiseLevel_Max'})

print(part)

part = part.rename(columns={'id': 'PartID', 'price': 'Price', 'manufacturer': 'Manufacturer', 'model': 'Model'})

# export all dataframes to csvs
part.to_csv('data/processed-data/ComputerPart.csv', index=False)

cpu[['PartID', 'Cores', 'BoostClock', 'CoreClock', 'Graphics', 'SMT', 'TDP']].to_csv('data/processed-data/CPU.csv', index=False)
gpu[['PartID', 'CoreClock', 'BoostClock', 'Memory', 'Chipset', 'Length', 'Color']].to_csv('data/processed-data/GPU.csv', index=False)
motherboard[['PartID', 'Socket', 'FormFactor', 'MaxMemory', 'MemorySlots', 'Color']].to_csv('data/processed-data/Motherboard.csv', index=False)
memory[['PartID', 'Color', 'FirstWord', 'CAS', 'PricePerGB', 'TotalCapacity', 'DDR', 'MHz', 'Count', 'Capacity']].to_csv('data/processed-data/RAM.csv', index=False)
storage[['PartID', 'PricePerGB', 'Capacity', 'FormFactor', 'Interface', 'Cache', 'Type']].to_csv('data/processed-data/Storage.csv', index=False)
psu[['PartID', 'FormFactor', 'Efficiency', 'Wattage', 'Modular', 'Color']].to_csv('data/processed-data/PSU.csv', index=False)
case[['PartID', 'FormFactor', 'StorageBays', 'Color', 'SidePanel', 'Size', 'PSU']].to_csv('data/processed-data/Case.csv', index=False)
cpucooler[['PartID', 'Size', 'Color', 'RPM_Min', 'RPM_Max', 'NoiseLevel_Min', 'NoiseLevel_Max']].to_csv('data/processed-data/CPUCooler.csv', index=False)
