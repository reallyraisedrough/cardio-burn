import importlib, sys
def dynamic_import(absolute_package_str, key):
    for amod in list(sys.modules):
        if amod.endswith(absolute_package_str):
            m = importlib.import_module(amod)
            return getattr(m, key)
    raise ValueError(absolute_package_str)
