import pandas as pd
import uuid

# create an empty dataframe to hold generic part info,
# aggregated from all tables
part = pd.DataFrame(columns=['id', 'price', 'manufacturer', 'model'])

cpu = pd.read_json('data/pcpartpicker/cpu.json')
cpu['id'] = [uuid.uuid4() for _ in range(len(cpu.index))]
splitname = cpu['name'].str.split(' ', n=1)
cpu['manufacturer'] = splitname.str[0]
cpu['model'] = splitname.str[1]
cpu = cpu.dropna(subset=['price'])

print(cpu)

part = part._append(cpu[['id', 'price', 'manufacturer', 'model']])

cpu = cpu.rename(columns={'id': 'PartID', 'core_count': 'Cores', 'boost_clock': 'BoostClock', 'core_clock': 'CoreClock', 'graphics': 'Graphics', 'smt': 'SMT', 'tdp': 'TDP'})

gpu = pd.read_json('data/pcpartpicker/video-card.json')
gpu['id'] = [uuid.uuid4() for _ in range(len(gpu.index))]
splitname = gpu['name'].str.split(' ', n=1)
gpu['manufacturer'] = splitname.str[0]
gpu['model'] = splitname.str[1]
gpu = gpu.dropna(subset=['price'])

print(gpu)

part = part._append(gpu[['id', 'price', 'manufacturer', 'model']])

# make a new table called chipset that holds an integer value (chipsetID) for each chipset, and a string value (name) for each chipset like a dictionary
chipset = pd.DataFrame(columns=['chipsetID', 'name'])
chipset['name'] = gpu['chipset'].unique()
chipset['chipsetID'] = range(1, len(chipset.index) + 1)

# merge the chipset table with the gpu table to get the chipsetID for each gpu
gpu = gpu.merge(chipset, left_on='chipset', right_on='name', how='left')

gpu = gpu.rename(columns={'id': 'PartID', 'core_clock': 'CoreClock', 'boost_clock': 'BoostClock', 'memory': 'Memory', 'chipset': 'Chipset', 'length': 'Length', 'color': 'Color', 'chipsetID': 'ChipsetID'})

# add unique cpu models to the chipset table
unique_cpu_models = pd.DataFrame({'name': cpu['model'].unique()})
chipset = chipset._append(unique_cpu_models, ignore_index=True)
chipset['chipsetID'] = range(1, len(chipset.index) + 1)

# merge the chipset table with the cpu table to get the chipsetID for each cpu
cpu = cpu.merge(chipset, left_on='model', right_on='name', how='left')

cpu = cpu.rename(columns={'id': 'PartID', 'core_count': 'Cores', 'boost_clock': 'BoostClock', 'core_clock': 'CoreClock', 'graphics': 'Graphics', 'smt': 'SMT', 'tdp': 'TDP', 'chipsetID': 'ChipsetID'})

chipset = chipset.rename(columns={'chipsetID': 'ChipsetID', 'name': 'Name'})

motherboard = pd.read_json('data/pcpartpicker/motherboard.json')
motherboard['id'] = [uuid.uuid4() for _ in range(len(motherboard.index))]
splitname = motherboard['name'].str.split(' ', n=1)
motherboard['manufacturer'] = splitname.str[0]
motherboard['model'] = splitname.str[1]
motherboard = motherboard.dropna(subset=['price'])

motherboard = motherboard[motherboard.form_factor != 'Thin Mini ITX']
motherboard = motherboard[motherboard.form_factor != 'Mini DTX']
motherboard = motherboard[motherboard.form_factor != 'SSI CEB']

print(motherboard)

part = part._append(motherboard[['id', 'price', 'manufacturer', 'model']])

motherboard = motherboard.rename(columns={'id': 'PartID', 'socket': 'Socket', 'form_factor': 'FormFactor', 'max_memory': 'MaxMemory', 'memory_slots': 'MemorySlots', 'color': 'Color'})

memory = pd.read_json('data/pcpartpicker/memory.json')
memory['id'] = [uuid.uuid4() for _ in range(len(memory.index))]
splitname = memory['name'].str.split(' ', n=1)
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

part = part._append(memory[['id', 'price', 'manufacturer', 'model']])

memory = memory.rename(columns={'id': 'PartID', 'color': 'Color', 'first_word_latency': 'FirstWord', 'cas_latency': 'CAS', 'price_per_gb': 'PricePerGB', 'TotalCapacity': 'TotalCapacity', 'DDR': 'DDR', 'MHz': 'MHz', 'Count': 'Count', 'Size': 'Capacity'})

storage = pd.read_json('data/pcpartpicker/internal-hard-drive.json')
storage['id'] = [uuid.uuid4() for _ in range(len(storage.index))]
splitname = storage['name'].str.split(' ', n=1)
storage['manufacturer'] = splitname.str[0]
storage['model'] = splitname.str[1]
storage = storage.dropna(subset=['price'])

storage.loc[storage['type'] == 'SSD', 'type'] = 0

print(storage)

part = part._append(storage[['id', 'price', 'manufacturer', 'model']])

storage = storage.rename(columns={'id': 'PartID', 'price_per_gb': 'PricePerGB', 'capacity': 'Capacity', 'form_factor': 'FormFactor', 'interface': 'Interface', 'cache': 'Cache', 'type': 'Type'})

psu = pd.read_json('data/pcpartpicker/power-supply.json')
psu['id'] = [uuid.uuid4() for _ in range(len(psu.index))]
splitname = psu['name'].str.split(' ', n=1)
psu['manufacturer'] = splitname.str[0]
psu['model'] = splitname.str[1]
psu = psu.dropna(subset=['price'])

print(psu)

part = part._append(psu[['id', 'price', 'manufacturer', 'model']])

psu = psu.rename(columns={'id': 'PartID', 'type': 'FormFactor', 'efficiency': 'Efficiency', 'wattage': 'Wattage', 'modular': 'Modular', 'color': 'Color'})

case = pd.read_json('data/pcpartpicker/case.json')
case['id'] = [uuid.uuid4() for _ in range(len(case.index))]
splitname = case['name'].str.split(' ', n=1)
case['manufacturer'] = splitname.str[0]
case['model'] = splitname.str[1]
case = case.dropna(subset=['price'])

print(case)

part = part._append(case[['id', 'price', 'manufacturer', 'model']])

case = case.rename(columns={'id': 'PartID', 'type': 'FormFactor', 'internal_35_bays': 'StorageBays', 'color': 'Color', 'side_panel': 'SidePanel', 'external_volume': 'Size', 'psu': 'PSU'})

cpucooler = pd.read_json('data/pcpartpicker/cpu-cooler.json')
cpucooler['id'] = [uuid.uuid4() for _ in range(len(cpucooler.index))]
splitname = cpucooler['name'].str.split(' ', n=1)
cpucooler['manufacturer'] = splitname.str[0]
cpucooler['model'] = splitname.str[1]
cpucooler = cpucooler.dropna(subset=['price'])

cpucooler['RPM_Min'] = cpucooler['rpm'].apply(lambda x: x[0] if isinstance(x, list) else x)
cpucooler['RPM_Max'] = cpucooler['rpm'].apply(lambda x: x[1] if isinstance(x, list) else x)

cpucooler['NoiseLevel_Min'] = cpucooler['noise_level'].apply(lambda x: x[0] if isinstance(x, list) else x)
cpucooler['NoiseLevel_Max'] = cpucooler['noise_level'].apply(lambda x: x[1] if isinstance(x, list) else x)

print(cpucooler)

part = part._append(cpucooler[['id', 'price', 'manufacturer', 'model']])

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
chipset[['ChipsetID', 'Name']].to_csv('data/processed-data/Chipset.csv', index=False)

# Read the benchmark files
cpuBench = pd.read_csv('data/benchmarks/CPU_benchmark_v4.csv')
# cpuCineBench = pd.read_csv('data/benchmarks/CPU_r23_v2.csv')
# cpuPassMarkLowEnd = pd.read_csv('data/benchmarks/LowEnd-2023-10-5-cpu.csv')
# cpuPassMarkLowMid = pd.read_csv('data/benchmarks/LowMid-2023-10-5-cpu.csv')
# cpuPassMarkMidHigh = pd.read_csv('data/benchmarks/MidHigh-2023-10-5-cpu.csv')
# cpuPassMarkHighEnd = pd.read_csv('data/benchmarks/HighEnd-2023-10-5-cpu.csv')
gpuBench = pd.read_csv('data/benchmarks/GPU_benchmarks_v7.csv')
gpuGraphicsAPI = pd.read_csv('data/benchmarks/GPU_scores_graphicsAPIs.csv')
gpuPassMarkLowEnd = pd.read_csv('data/benchmarks/LowEnd-2023-10-5-gpu.csv')
gpuPassMarkLowMid = pd.read_csv('data/benchmarks/LowMid-2023-10-5-gpu.csv')
gpuPassMarkMidHigh = pd.read_csv('data/benchmarks/MidHigh-2023-10-5-gpu.csv')
gpuPassMarkHighEnd = pd.read_csv('data/benchmarks/HighEnd-2023-10-5-gpu.csv')

# make a benchmarks table that holds a unique a chipsetID, a type (CPUMark, ThreadMark, etc.), and a score
benchmarks = pd.DataFrame(columns=['ChipsetID', 'Type', 'Score'])

# import each benchmark from each of the benchmark dataframes into the benchmarks table
# For gpuBench
for index, row in gpuBench.iterrows():
    matching_chipset = chipset[chipset['Name'] == row['gpuName']]
    if not matching_chipset.empty:
        chipset_id = matching_chipset['ChipsetID'].values[0]
        benchmarks = benchmarks._append({
            'ChipsetID': chipset_id,
            'Type': 'G3Dmark',
            'Score': row['G3Dmark']
        }, ignore_index=True)
        benchmarks = benchmarks._append({
            'ChipsetID': chipset_id,
            'Type': 'G2Dmark',
            'Score': row['G2Dmark']
        }, ignore_index=True)

# For gpuGraphicsAPI
for index, row in gpuGraphicsAPI.iterrows():
    matching_chipset = chipset[chipset['Name'] == row['Device']]
    if not matching_chipset.empty:
        chipset_id = matching_chipset['ChipsetID'].values[0]
        for api_type in ['CUDA', 'Metal', 'OpenCL', 'Vulkan']:
            benchmarks = benchmarks._append({
                'ChipsetID': chipset_id,
                'Type': api_type,
                'Score': row[api_type]
            }, ignore_index=True)

# For PassMark files
passmark_files = [gpuPassMarkLowEnd, gpuPassMarkLowMid, gpuPassMarkMidHigh, gpuPassMarkHighEnd]
for file in passmark_files:
    for index, row in file.iterrows():
        matching_chipset = chipset[chipset['Name'] == row[1]]
        if not matching_chipset.empty:
            chipset_id = matching_chipset['ChipsetID'].values[0]
            benchmarks = benchmarks._append({
                'ChipsetID': chipset_id,
                'Type': 'PassMarkGPU',
                'Score': row[2]
            }, ignore_index=True)


# import CPU benchmarks
cpuBenchmarks = pd.read_csv('data/benchmarks/CPUBenchmarks.csv')

# add the CPU benchmarks to the benchmarks table
for index, row in cpuBenchmarks.iterrows():
    benchmarks = benchmarks._append({
        'ChipsetID': row['ChipsetID'],
        'Type': row['Type'],
        'Score': row['Score']
    }, ignore_index=True)


benchmarks.to_csv('data/processed-data/Benchmark.csv', index=False)

for index, row in cpuBench.iterrows():
    splitname = cpuBench['cpuName'].str.split(' ', n=1, expand=True)
    cpuBench['manufacturer'] = splitname[0]
    cpuBench['model'] = splitname[1]

# For cpuBench
for index, row in cpuBench.iterrows():
    matching_chipset = chipset[chipset['Name'] == row['model']]
    if not matching_chipset.empty:
        chipset_id = matching_chipset['ChipsetID'].values[0]
        cpu.loc[cpu['ChipsetID'] == chipset_id, 'Socket'] = row['socket']

# For gpuBench
for index, row in gpuBench.iterrows():
    matching_chipset = chipset[chipset['Name'] == row['gpuName']]
    if not matching_chipset.empty:
        chipset_id = matching_chipset['ChipsetID'].values[0]
        gpu.loc[gpu['ChipsetID'] == chipset_id, 'TDP'] = row['TDP']


# import CPU info
intelcpus = pd.read_csv('data/cpu/intel_processors.csv')
amdcpus = pd.read_csv('data/cpu/amd_processors.csv')

for index, row in intelcpus.iterrows():
    splitname = intelcpus['name'].str.split(' ', n=1, expand=True)
    intelcpus['manufacturer'] = splitname[0]
    intelcpus['model'] = splitname[1]

for index, row in amdcpus.iterrows():
    splitname = amdcpus['name'].str.split(' ', n=1, expand=True)
    amdcpus['manufacturer'] = splitname[0]
    amdcpus['model'] = splitname[1]

# For intelcpus
for index, row in intelcpus.iterrows():
    matching_chipset = chipset[chipset['Name'] == row['model']]
    if not matching_chipset.empty:
        print(matching_chipset)
        chipset_id = matching_chipset['ChipsetID'].values[0]
        cpu.loc[cpu['ChipsetID'] == chipset_id, 'Socket'] = row['socket']

# For amdcpus
for index, row in amdcpus.iterrows():
    matching_chipset = chipset[chipset['Name'] == row['model']]
    if not matching_chipset.empty:
        print(matching_chipset)
        chipset_id = matching_chipset['ChipsetID'].values[0]
        cpu.loc[cpu['ChipsetID'] == chipset_id, 'Socket'] = row['socket']

# re-export gpu and cpu tables
cpu[['PartID', 'Cores', 'BoostClock', 'CoreClock', 'Graphics', 'SMT', 'TDP', 'Socket']].to_csv('data/processed-data/CPU.csv', index=False)
gpu[['PartID', 'CoreClock', 'BoostClock', 'Memory', 'Chipset', 'Length', 'Color', 'TDP']].to_csv('data/processed-data/GPU.csv', index=False)

